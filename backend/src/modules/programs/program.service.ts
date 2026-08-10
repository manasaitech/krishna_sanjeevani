import { ProgramRepository } from "./program.repository";
import {
  CreateProgramInput,
  UpdateProgramInput,
  ProgramFilters,
  AddTrackInput,
  ReorderTracksInput,
  PaginatedResult,
} from "./program.types";
import {
  PregnancyUserInfoInput,
  PregnancyScheduleInput,
  UpdatePregnancyScheduleInput,
  PregnancyCalculatedWeek,
} from "./pregnancy.types";
import { PROGRAM_CONSTANTS } from "./program.constants";
import { NotFoundError, ValidationError, ConflictError } from "../../shared/errors";
import { logger } from "../../shared/logger";

// Inline interface for the track existence check (avoids circular import)
interface TrackChecker {
  findTrackById(id: string): Promise<any>;
}

export class ProgramService {
  constructor(
    private repo: ProgramRepository,
    private trackChecker?: TrackChecker
  ) {}

  // ── Program CRUD ─────────────────────────────────────

  async createProgram(input: CreateProgramInput, userId: string) {
    logger.info("Creating new program", { title: input.title, userId });

    const now = Date.now();
    const programId = crypto.randomUUID();

    await this.repo.createProgram({
      id: programId,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      thumbnailKey: input.thumbnailKey,
      category: input.category,
      difficulty: input.difficulty ?? "beginner",
      language: input.language ?? "hi",
      tier: input.tier ?? "free",
      status: "draft",
      programTypeId: input.programTypeId ?? "1", // defaults to Therapeutic ('1')
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    logger.info("Program created successfully", { programId });

    return this.repo.findProgramById(programId);
  }

  async getProgram(id: string) {
    const program = await this.repo.findProgramById(id);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    const trackCount = await this.repo.countTracksByProgramId(id);

    return { ...program, trackCount };
  }

  async listPrograms(filters: ProgramFilters, publishedOnly: boolean): Promise<PaginatedResult<any>> {
    const [data, total] = await Promise.all([
      this.repo.findPrograms(filters, publishedOnly),
      this.repo.countPrograms(filters, publishedOnly),
    ]);

    // Attach track counts to each program
    const programsWithCounts = await Promise.all(
      data.map(async (program: any) => {
        const trackCount = await this.repo.countTracksByProgramId(program.id);
        return { ...program, trackCount };
      })
    );

    const totalPages = Math.ceil(total / filters.limit);

    return {
      data: programsWithCounts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    };
  }

  async updateProgram(id: string, input: UpdateProgramInput, userId: string) {
    logger.info("Updating program", { programId: id, userId });

    const existing = await this.repo.findProgramById(id);
    if (!existing) {
      throw new NotFoundError("Program not found");
    }

    const updateData: Record<string, any> = {
      updatedBy: userId,
      updatedAt: Date.now(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.thumbnailKey !== undefined) updateData.thumbnailKey = input.thumbnailKey;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.tier !== undefined) updateData.tier = input.tier;
    if (input.programTypeId !== undefined) updateData.programTypeId = input.programTypeId;

    await this.repo.updateProgram(id, updateData);

    logger.info("Program updated successfully", { programId: id });

    const program = await this.repo.findProgramById(id);
    const trackCount = await this.repo.countTracksByProgramId(id);

    return { ...program, trackCount };
  }

  // ── Publishing Workflow ──────────────────────────────

  async publishProgram(id: string, userId: string) {
    logger.info("Publishing program", { programId: id, userId });

    const program = await this.repo.findProgramById(id);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    // Validate publishing prerequisites
    const errors: string[] = [];

    const trackCount = await this.repo.countTracksByProgramId(id);
    if (trackCount === 0) {
      errors.push("Program must have at least one track before publishing.");
    }

    if (!program.thumbnailKey) {
      errors.push("Thumbnail is required before publishing. Set thumbnail_key.");
    }

    if (!program.title || !program.category || !program.language) {
      errors.push("Required metadata is incomplete. title, category, and language are required.");
    }

    if (errors.length > 0) {
      throw new ValidationError("Program cannot be published. Resolve the following issues:", errors);
    }

    await this.repo.updateProgram(id, {
      status: "published",
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    logger.info("Program published successfully", { programId: id });

    const updated = await this.repo.findProgramById(id);
    return { ...updated, trackCount };
  }

  // ── Archive Workflow ─────────────────────────────────

  async archiveProgram(id: string, userId: string) {
    logger.info("Archiving program", { programId: id, userId });

    const program = await this.repo.findProgramById(id);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    await this.repo.updateProgram(id, {
      status: "archived",
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    logger.info("Program archived successfully", { programId: id });

    const updated = await this.repo.findProgramById(id);
    const trackCount = await this.repo.countTracksByProgramId(id);

    return { ...updated, trackCount };
  }

  async unpublishProgram(id: string, userId: string) {
    logger.info("Unpublishing program", { programId: id, userId });

    const program = await this.repo.findProgramById(id);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    await this.repo.updateProgram(id, {
      status: "draft",
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    logger.info("Program unpublished successfully", { programId: id });

    const updated = await this.repo.findProgramById(id);
    const trackCount = await this.repo.countTracksByProgramId(id);

    return { ...updated, trackCount };
  }

  async getProgramStats() {
    return this.repo.getProgramStats();
  }

  async getPregnancySchedulesForProgram(programId: string) {
    return this.repo.findSchedulesByProgramId(programId);
  }

  // ── Soft Delete ──────────────────────────────────────

  async deleteProgram(id: string, userId: string) {
    logger.info("Soft-deleting program", { programId: id, userId });

    const program = await this.repo.findProgramById(id);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    await this.repo.softDeleteProgram(id, userId);

    logger.info("Program soft-deleted successfully", { programId: id });
  }

  // ── Track Management ─────────────────────────────────

  async addTrack(programId: string, input: AddTrackInput, userId: string) {
    logger.info("Adding track to program", { programId, trackId: input.trackId, userId });

    const program = await this.repo.findProgramById(programId);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    // Validate track exists
    if (this.trackChecker) {
      const track = await this.trackChecker.findTrackById(input.trackId);
      if (!track) {
        throw new NotFoundError("Track not found");
      }
    }

    // Check for duplicate assignment
    const existing = await this.repo.findProgramTrackEntry(programId, input.trackId);
    if (existing) {
      throw new ConflictError("Track is already assigned to this program");
    }

    // Check max tracks limit
    const currentCount = await this.repo.countTracksByProgramId(programId);
    if (currentCount >= PROGRAM_CONSTANTS.MAX_TRACKS_PER_PROGRAM) {
      throw new ValidationError(
        `Program cannot have more than ${PROGRAM_CONSTANTS.MAX_TRACKS_PER_PROGRAM} tracks`
      );
    }

    await this.repo.addTrackToProgram({
      programId,
      trackId: input.trackId,
      sequence: input.sequence,
      isRequired: input.isRequired !== false ? 1 : 0,
      createdAt: Date.now(),
    });

    // Recalculate estimated duration
    await this.recalculateEstimatedDuration(programId, userId);

    logger.info("Track added to program successfully", { programId, trackId: input.trackId });

    return this.getProgramTracks(programId);
  }

  async removeTrack(programId: string, trackId: string, userId: string) {
    logger.info("Removing track from program", { programId, trackId, userId });

    const program = await this.repo.findProgramById(programId);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    const entry = await this.repo.findProgramTrackEntry(programId, trackId);
    if (!entry) {
      throw new NotFoundError("Track is not assigned to this program");
    }

    await this.repo.removeTrackFromProgram(programId, trackId);

    // Recalculate estimated duration
    await this.recalculateEstimatedDuration(programId, userId);

    logger.info("Track removed from program successfully", { programId, trackId });
  }

  async reorderTracks(programId: string, input: ReorderTracksInput, userId: string) {
    logger.info("Reordering program tracks", { programId, trackCount: input.tracks.length, userId });

    const program = await this.repo.findProgramById(programId);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    // Validate all trackIds belong to this program
    const existingTracks = await this.repo.findRawProgramTracks(programId);
    const existingTrackIds = new Set(existingTracks.map((t) => t.trackId));

    const invalidIds = input.tracks
      .filter((t) => !existingTrackIds.has(t.trackId))
      .map((t) => t.trackId);

    if (invalidIds.length > 0) {
      throw new ValidationError(
        `The following tracks are not assigned to this program: ${invalidIds.join(", ")}`
      );
    }

    // Validate no duplicate sequences
    const sequences = input.tracks.map((t) => t.sequence);
    const uniqueSequences = new Set(sequences);
    if (uniqueSequences.size !== sequences.length) {
      throw new ValidationError("Duplicate sequence numbers are not allowed");
    }

    await this.repo.updateTrackSequences(programId, input.tracks);

    // Update program's updatedAt timestamp
    await this.repo.updateProgram(programId, {
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    logger.info("Program tracks reordered successfully", { programId });

    return this.getProgramTracks(programId);
  }

  async getProgramTracks(programId: string) {
    const program = await this.repo.findProgramById(programId);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    return this.repo.findTracksByProgramId(programId);
  }

  // ── Duplicate ────────────────────────────────────────

  async duplicateProgram(id: string, userId: string) {
    logger.info("Duplicating program", { sourceProgramId: id, userId });

    const source = await this.repo.findProgramById(id);
    if (!source) {
      throw new NotFoundError("Program not found");
    }

    const now = Date.now();
    const newProgramId = crypto.randomUUID();

    // Deep copy program metadata
    await this.repo.createProgram({
      id: newProgramId,
      title: `${source.title} (Copy)`,
      subtitle: source.subtitle ?? undefined,
      description: source.description ?? undefined,
      thumbnailKey: source.thumbnailKey ?? undefined,
      category: source.category,
      difficulty: source.difficulty,
      language: source.language,
      tier: source.tier,
      status: "draft", // always start as draft
      programTypeId: source.programTypeId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Deep copy track assignments
    const sourceTracks = await this.repo.findRawProgramTracks(id);
    for (const track of sourceTracks) {
      await this.repo.addTrackToProgram({
        programId: newProgramId,
        trackId: track.trackId,
        sequence: track.sequence,
        isRequired: track.isRequired,
        createdAt: now,
      });
    }

    // Copy estimated duration
    if (source.estimatedDuration) {
      await this.repo.updateProgram(newProgramId, {
        estimatedDuration: source.estimatedDuration,
        updatedAt: now,
      });
    }

    logger.info("Program duplicated successfully", {
      sourceProgramId: id,
      newProgramId,
    });

    const newProgram = await this.repo.findProgramById(newProgramId);
    const trackCount = await this.repo.countTracksByProgramId(newProgramId);

    return { ...newProgram, trackCount };
  }

  // ── Private Helpers ──────────────────────────────────

  /**
   * Recalculates and persists the estimated_duration for a program
   * by summing the durations of all assigned tracks.
   */
  private async recalculateEstimatedDuration(programId: string, userId: string) {
    const totalDuration = await this.repo.sumTrackDurations(programId);

    await this.repo.updateProgram(programId, {
      estimatedDuration: totalDuration ?? undefined,
      updatedBy: userId,
      updatedAt: Date.now(),
    });
  }

  // ── Pregnancy Calculations ────────────────────────────

  calculatePregnancyWeek(profile: any): { week: number; day: number; month: number } | null {
    if (profile.pregnancyEdd) {
      const eddDate = new Date(profile.pregnancyEdd);
      if (isNaN(eddDate.getTime())) return null;

      const edd = eddDate.getTime();
      const now = Date.now();
      
      // Gestational start (LMP) is 280 days before EDD
      const startTimestamp = edd - (280 * 24 * 60 * 60 * 1000);
      const elapsedMs = now - startTimestamp;
      
      if (elapsedMs < 0) {
        return { week: 1, day: 1, month: 1 };
      }

      const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
      const week = Math.min(40, Math.floor(elapsedDays / 7) + 1);
      const day = (elapsedDays % 7) + 1;
      const month = Math.min(9, Math.floor((week - 1) / 4.5) + 1);
      
      return { week, day, month };
    }

    if (profile.pregnancyWeekStart && profile.pregnancyWeekStartWeek != null) {
      const elapsedMs = Date.now() - profile.pregnancyWeekStart;
      const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
      
      const additionalWeeks = Math.floor(elapsedDays / 7);
      const week = Math.min(40, profile.pregnancyWeekStartWeek + additionalWeeks);
      const day = (elapsedDays % 7) + 1;
      const month = Math.min(9, Math.floor((week - 1) / 4.5) + 1);
      
      return { week, day, month };
    }

    return null;
  }

  // ── Pregnancy Schedule Methods ────────────────────────

  async getTodayPregnancyProgram(userId: string) {
    logger.info("Fetching today's pregnancy program", { userId });

    const profile = await this.repo.findUserProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }

    const calc = this.calculatePregnancyWeek(profile);
    if (!calc) {
      return { setNeeded: true, message: "Pregnancy info (EDD or Week) not configured" };
    }

    logger.info("Calculated pregnancy status", { userId, ...calc });

    const schedule = await this.repo.findScheduleByWeekAndDay(calc.week, calc.day);
    if (!schedule) {
      return {
        setNeeded: false,
        gestationalDetails: calc,
        program: null,
        message: `No program scheduled for Week ${calc.week}, Day ${calc.day}`,
      };
    }

    // Get program tracks and user progress
    const tracks = await this.repo.findTracksByProgramId(schedule.programId);
    const progress = await this.getProgramProgress(userId, schedule.programId);

    return {
      setNeeded: false,
      gestationalDetails: calc,
      scheduleDetails: {
        scheduleId: schedule.scheduleId,
        pregnancyMonth: schedule.pregnancyMonth,
        isRequired: schedule.isRequired,
      },
      program: {
        ...schedule.program,
        tracks,
        progress,
      },
    };
  }

  async getPregnancyProgramForWeek(week: number) {
    const schedules = await this.repo.findScheduleByWeek(week);
    return Promise.all(
      schedules.map(async (s) => {
        const trackCount = await this.repo.countTracksByProgramId(s.programId);
        return {
          scheduleId: s.scheduleId,
          pregnancyMonth: s.pregnancyMonth,
          week: s.week,
          day: s.day,
          unlockAfterDays: s.unlockAfterDays,
          isRequired: s.isRequired,
          program: {
            ...s.program,
            trackCount,
          },
        };
      })
    );
  }

  async getPregnancyProgramForMonth(month: number) {
    const schedules = await this.repo.findScheduleByMonth(month);
    return Promise.all(
      schedules.map(async (s) => {
        const trackCount = await this.repo.countTracksByProgramId(s.programId);
        return {
          scheduleId: s.scheduleId,
          pregnancyMonth: s.pregnancyMonth,
          week: s.week,
          day: s.day,
          unlockAfterDays: s.unlockAfterDays,
          isRequired: s.isRequired,
          program: {
            ...s.program,
            trackCount,
          },
        };
      })
    );
  }

  async listAllPregnancySchedules() {
    const schedules = await this.repo.findAllSchedules();
    return Promise.all(
      schedules.map(async (s) => {
        const trackCount = await this.repo.countTracksByProgramId(s.programId);
        return {
          scheduleId: s.scheduleId,
          pregnancyMonth: s.pregnancyMonth,
          week: s.week,
          day: s.day,
          unlockAfterDays: s.unlockAfterDays,
          isRequired: s.isRequired,
          program: {
            ...s.program,
            trackCount,
          },
        };
      })
    );
  }

  async createPregnancySchedule(input: PregnancyScheduleInput) {
    logger.info("Creating pregnancy schedule entry", { ...input });

    const program = await this.repo.findProgramById(input.programId);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    // Verify program is type Pregnancy ('3')
    if (program.programTypeId !== "3") {
      throw new ValidationError("Only Pregnancy Programs (type '3') can be added to the schedule");
    }

    const scheduleId = crypto.randomUUID();
    const now = Date.now();

    await this.repo.createScheduleEntry({
      id: scheduleId,
      programId: input.programId,
      pregnancyMonth: input.pregnancyMonth,
      week: input.week,
      day: input.day,
      unlockAfterDays: input.unlockAfterDays ?? 0,
      isRequired: input.isRequired ?? 1,
      createdAt: now,
      updatedAt: now,
    });

    logger.info("Pregnancy schedule entry created successfully", { scheduleId });
    return this.repo.findScheduleById(scheduleId);
  }

  async updatePregnancySchedule(id: string, input: UpdatePregnancyScheduleInput) {
    logger.info("Updating pregnancy schedule entry", { id, ...input });

    const schedule = await this.repo.findScheduleById(id);
    if (!schedule) {
      throw new NotFoundError("Pregnancy schedule entry not found");
    }

    if (input.programId) {
      const program = await this.repo.findProgramById(input.programId);
      if (!program) {
        throw new NotFoundError("Program not found");
      }
      if (program.programTypeId !== "3") {
        throw new ValidationError("Only Pregnancy Programs (type '3') can be added to the schedule");
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (input.programId !== undefined) updateData.programId = input.programId;
    if (input.pregnancyMonth !== undefined) updateData.pregnancyMonth = input.pregnancyMonth;
    if (input.week !== undefined) updateData.week = input.week;
    if (input.day !== undefined) updateData.day = input.day;
    if (input.unlockAfterDays !== undefined) updateData.unlockAfterDays = input.unlockAfterDays;
    if (input.isRequired !== undefined) updateData.isRequired = input.isRequired;

    await this.repo.updateScheduleEntry(id, updateData);

    logger.info("Pregnancy schedule entry updated successfully", { id });
    return this.repo.findScheduleById(id);
  }

  async deletePregnancySchedule(id: string) {
    logger.info("Deleting pregnancy schedule entry", { id });

    const schedule = await this.repo.findScheduleById(id);
    if (!schedule) {
      throw new NotFoundError("Pregnancy schedule entry not found");
    }

    await this.repo.deleteScheduleEntry(id);
    logger.info("Pregnancy schedule entry deleted successfully", { id });
  }

  async updateUserPregnancyInfo(userId: string, input: PregnancyUserInfoInput) {
    logger.info("Updating user pregnancy details", { userId, ...input });

    const profile = await this.repo.findUserProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }

    const updateData = {
      pregnancyEdd: input.edd ?? null,
      pregnancyWeekStart: input.currentWeek ? Date.now() : null,
      pregnancyWeekStartWeek: input.currentWeek ?? null,
      updatedAt: Date.now(),
    };

    await this.repo.updateUserProfilePregnancyInfo(userId, updateData);
    logger.info("User pregnancy info updated successfully", { userId });

    const updatedProfile = await this.repo.findUserProfileByUserId(userId);
    const gestationalDetails = this.calculatePregnancyWeek(updatedProfile);

    return {
      profile: updatedProfile,
      gestationalDetails,
    };
  }

  // ── Unified Progress Engine ───────────────────────────

  async getProgramProgress(userId: string, programId: string) {
    const progress = await this.repo.findProgress(userId, programId);
    if (!progress) {
      return {
        completedTracks: [],
        progressPercentage: 0,
        startedAt: null,
        completedAt: null,
      };
    }

    try {
      return {
        completedTracks: JSON.parse(progress.completedTracks),
        progressPercentage: progress.progressPercentage,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
      };
    } catch {
      return {
        completedTracks: [],
        progressPercentage: 0,
        startedAt: progress.startedAt,
        completedAt: null,
      };
    }
  }

  async completeTrackInProgram(userId: string, programId: string, trackId: string, complete: boolean) {
    logger.info("Updating track completion progress", { userId, programId, trackId, complete });

    const program = await this.repo.findProgramById(programId);
    if (!program) {
      throw new NotFoundError("Program not found");
    }

    // Get all tracks mapped to this program
    const programTracksList = await this.repo.findTracksByProgramId(programId);
    const validTrackIds = new Set(programTracksList.map((t) => t.id));

    if (!validTrackIds.has(trackId)) {
      throw new ValidationError("Track is not assigned to this program");
    }

    const totalTracksCount = programTracksList.length;
    if (totalTracksCount === 0) {
      throw new ValidationError("Program has no tracks to track progress against");
    }

    // Retrieve or baseline progress record
    const existing = await this.repo.findProgress(userId, programId);
    let completedTrackIds: string[] = [];

    if (existing) {
      try {
        completedTrackIds = JSON.parse(existing.completedTracks);
      } catch {
        completedTrackIds = [];
      }
    }

    const completedSet = new Set(completedTrackIds);
    if (complete) {
      completedSet.add(trackId);
    } else {
      completedSet.delete(trackId);
    }

    const newCompletedList = Array.from(completedSet);
    const progressPercentage = Math.round((newCompletedList.length / totalTracksCount) * 100);

    const now = Date.now();
    const startedAt = existing ? existing.startedAt : now;
    let completedAt = existing ? existing.completedAt : null;

    if (progressPercentage === 100 && !completedAt) {
      completedAt = now;
    } else if (progressPercentage < 100) {
      completedAt = null;
    }

    const progressId = existing ? existing.id : crypto.randomUUID();

    await this.repo.upsertProgress({
      id: progressId,
      userId,
      programId,
      completedTracks: JSON.stringify(newCompletedList),
      progressPercentage,
      startedAt,
      completedAt,
      updatedAt: now,
    });

    logger.info("Track progress updated successfully", {
      userId,
      programId,
      progressPercentage,
    });

    return {
      completedTracks: newCompletedList,
      progressPercentage,
      startedAt,
      completedAt,
    };
  }
}

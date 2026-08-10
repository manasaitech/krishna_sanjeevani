import { eq, and, like, or, sql, isNull } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { programs, programTracks } from "../../shared/db/schema/program";
import { tracks } from "../../shared/db/schema/track";
import * as schema from "../../shared/db/schema";
import { ProgramFilters } from "./program.types";

export class ProgramRepository {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  // ── Programs ──────────────────────────────────────────

  async createProgram(data: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    thumbnailKey?: string;
    category: string;
    difficulty: string;
    language: string;
    tier: string;
    status: string;
    programTypeId: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
  }) {
    await this.db.insert(programs).values(data as any);
  }

  async findProgramById(id: string) {
    const result = await this.db
      .select()
      .from(programs)
      .where(and(eq(programs.id, id), isNull(programs.deletedAt)))
      .limit(1);
    return result[0] ?? null;
  }

  /**
   * Find a program by ID including soft-deleted programs (for admin operations).
   */
  async findProgramByIdIncludeDeleted(id: string) {
    const result = await this.db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findPrograms(filters: ProgramFilters, publishedOnly: boolean) {
    const conditions = this.buildFilterConditions(filters, publishedOnly);
    const offset = (filters.page - 1) * filters.limit;

    const result = await this.db
      .select()
      .from(programs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(filters.limit)
      .offset(offset)
      .orderBy(sql`${programs.createdAt} DESC`);

    return result;
  }

  async countPrograms(filters: ProgramFilters, publishedOnly: boolean): Promise<number> {
    const conditions = this.buildFilterConditions(filters, publishedOnly);

    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(programs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result[0]?.count ?? 0);
  }

  async updateProgram(
    id: string,
    data: Partial<{
      title: string;
      subtitle: string;
      description: string;
      thumbnailKey: string;
      category: string;
      difficulty: string;
      estimatedDuration: number;
      language: string;
      tier: string;
      status: string;
      programTypeId: string;
      updatedBy: string;
      updatedAt: number;
    }>
  ) {
    await this.db.update(programs).set(data as any).where(eq(programs.id, id));
  }

  async softDeleteProgram(id: string, deletedBy: string) {
    const now = Date.now();
    await this.db
      .update(programs)
      .set({
        deletedAt: now,
        deletedBy,
        status: "deleted",
        updatedBy: deletedBy,
        updatedAt: now,
      })
      .where(eq(programs.id, id));
  }

  // ── Program Tracks ───────────────────────────────────

  async addTrackToProgram(data: {
    programId: string;
    trackId: string;
    sequence: number;
    isRequired: number;
    createdAt: number;
  }) {
    await this.db.insert(programTracks).values(data);
  }

  async removeTrackFromProgram(programId: string, trackId: string) {
    await this.db
      .delete(programTracks)
      .where(
        and(
          eq(programTracks.programId, programId),
          eq(programTracks.trackId, trackId)
        )
      );
  }

  async findProgramTrackEntry(programId: string, trackId: string) {
    const result = await this.db
      .select()
      .from(programTracks)
      .where(
        and(
          eq(programTracks.programId, programId),
          eq(programTracks.trackId, trackId)
        )
      )
      .limit(1);
    return result[0] ?? null;
  }

  /**
   * Returns all tracks for a program, ordered by sequence, with full track metadata.
   */
  async findTracksByProgramId(programId: string) {
    const result = await this.db
      .select({
        // Program-track junction fields
        sequence: programTracks.sequence,
        isRequired: programTracks.isRequired,
        addedAt: programTracks.createdAt,
        // Track metadata fields
        id: tracks.id,
        title: tracks.title,
        subtitle: tracks.subtitle,
        description: tracks.description,
        artist: tracks.artist,
        duration: tracks.duration,
        category: tracks.category,
        language: tracks.language,
        tier: tracks.tier,
        thumbnailKey: tracks.thumbnailKey,
        processingStatus: tracks.processingStatus,
        publishStatus: tracks.publishStatus,
      })
      .from(programTracks)
      .innerJoin(tracks, eq(programTracks.trackId, tracks.id))
      .where(eq(programTracks.programId, programId))
      .orderBy(sql`${programTracks.sequence} ASC`);

    return result;
  }

  async countTracksByProgramId(programId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(programTracks)
      .where(eq(programTracks.programId, programId));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Update sequence numbers for tracks in a program.
   * Executes individual updates for each track — D1 doesn't support batch CASE/WHEN.
   */
  async updateTrackSequences(
    programId: string,
    trackSequences: Array<{ trackId: string; sequence: number }>
  ) {
    for (const { trackId, sequence } of trackSequences) {
      await this.db
        .update(programTracks)
        .set({ sequence })
        .where(
          and(
            eq(programTracks.programId, programId),
            eq(programTracks.trackId, trackId)
          )
        );
    }
  }

  async removeAllTracksFromProgram(programId: string) {
    await this.db
      .delete(programTracks)
      .where(eq(programTracks.programId, programId));
  }

  /**
   * Returns raw program_tracks entries (without joining tracks table).
   * Used for duplication and internal operations.
   */
  async findRawProgramTracks(programId: string) {
    return this.db
      .select()
      .from(programTracks)
      .where(eq(programTracks.programId, programId))
      .orderBy(sql`${programTracks.sequence} ASC`);
  }

  /**
   * Sums the duration of all tracks assigned to a program.
   * Returns null if no tracks have a duration set.
   */
  async sumTrackDurations(programId: string): Promise<number | null> {
    const result = await this.db
      .select({ total: sql<number>`sum(${tracks.duration})` })
      .from(programTracks)
      .innerJoin(tracks, eq(programTracks.trackId, tracks.id))
      .where(eq(programTracks.programId, programId));

    const total = result[0]?.total;
    return total != null ? Number(total) : null;
  }

  async getProgramStats() {
    const [totalCount, publishedCount, draftCount, archivedCount] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(programs)
        .where(isNull(programs.deletedAt)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(programs)
        .where(and(isNull(programs.deletedAt), eq(programs.status, "published"))),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(programs)
        .where(and(isNull(programs.deletedAt), eq(programs.status, "draft"))),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(programs)
        .where(and(isNull(programs.deletedAt), eq(programs.status, "archived"))),
    ]);

    return {
      total: Number(totalCount[0]?.count ?? 0),
      published: Number(publishedCount[0]?.count ?? 0),
      draft: Number(draftCount[0]?.count ?? 0),
      archived: Number(archivedCount[0]?.count ?? 0),
    };
  }

  async findSchedulesByProgramId(programId: string) {
    return this.db
      .select()
      .from(schema.pregnancySchedule)
      .where(eq(schema.pregnancySchedule.programId, programId))
      .orderBy(sql`${schema.pregnancySchedule.week} ASC, ${schema.pregnancySchedule.day} ASC`);
  }

  // ── Private Helpers ──────────────────────────────────

  private buildFilterConditions(filters: ProgramFilters, publishedOnly: boolean) {
    const conditions: any[] = [];

    // Always exclude soft-deleted programs
    conditions.push(isNull(programs.deletedAt));

    // Public endpoints only see published programs
    if (publishedOnly) {
      conditions.push(eq(programs.status, "published"));
    }

    // Status filter
    if (!publishedOnly && filters.status) {
      conditions.push(eq(programs.status, filters.status));
    }

    // Search across title, subtitle, description
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(programs.title, searchPattern),
          like(programs.subtitle, searchPattern),
          like(programs.description, searchPattern)
        )
      );
    }

    // Category filter
    if (filters.category) {
      conditions.push(eq(programs.category, filters.category));
    }

    // Difficulty filter
    if (filters.difficulty) {
      conditions.push(eq(programs.difficulty, filters.difficulty));
    }

    // Language filter
    if (filters.language) {
      conditions.push(eq(programs.language, filters.language));
    }

    // Tier filter
    if (filters.tier) {
      conditions.push(eq(programs.tier, filters.tier));
    }

    // Program Type ID filter
    if (filters.programTypeId) {
      conditions.push(eq(programs.programTypeId, filters.programTypeId));
    }

    return conditions;
  }

  // ── Pregnancy Schedule ────────────────────────────────

  async findScheduleById(id: string) {
    const result = await this.db
      .select()
      .from(schema.pregnancySchedule)
      .where(eq(schema.pregnancySchedule.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findScheduleByWeekAndDay(week: number, day: number) {
    const result = await this.db
      .select({
        scheduleId: schema.pregnancySchedule.id,
        programId: schema.pregnancySchedule.programId,
        pregnancyMonth: schema.pregnancySchedule.pregnancyMonth,
        week: schema.pregnancySchedule.week,
        day: schema.pregnancySchedule.day,
        unlockAfterDays: schema.pregnancySchedule.unlockAfterDays,
        isRequired: schema.pregnancySchedule.isRequired,
        program: programs,
      })
      .from(schema.pregnancySchedule)
      .innerJoin(programs, eq(schema.pregnancySchedule.programId, programs.id))
      .where(
        and(
          eq(schema.pregnancySchedule.week, week),
          eq(schema.pregnancySchedule.day, day),
          isNull(programs.deletedAt)
        )
      )
      .limit(1);
    return result[0] ?? null;
  }

  async findScheduleByWeek(week: number) {
    return this.db
      .select({
        scheduleId: schema.pregnancySchedule.id,
        programId: schema.pregnancySchedule.programId,
        pregnancyMonth: schema.pregnancySchedule.pregnancyMonth,
        week: schema.pregnancySchedule.week,
        day: schema.pregnancySchedule.day,
        unlockAfterDays: schema.pregnancySchedule.unlockAfterDays,
        isRequired: schema.pregnancySchedule.isRequired,
        program: programs,
      })
      .from(schema.pregnancySchedule)
      .innerJoin(programs, eq(schema.pregnancySchedule.programId, programs.id))
      .where(
        and(
          eq(schema.pregnancySchedule.week, week),
          isNull(programs.deletedAt)
        )
      )
      .orderBy(sql`${schema.pregnancySchedule.day} ASC`);
  }

  async findScheduleByMonth(month: number) {
    return this.db
      .select({
        scheduleId: schema.pregnancySchedule.id,
        programId: schema.pregnancySchedule.programId,
        pregnancyMonth: schema.pregnancySchedule.pregnancyMonth,
        week: schema.pregnancySchedule.week,
        day: schema.pregnancySchedule.day,
        unlockAfterDays: schema.pregnancySchedule.unlockAfterDays,
        isRequired: schema.pregnancySchedule.isRequired,
        program: programs,
      })
      .from(schema.pregnancySchedule)
      .innerJoin(programs, eq(schema.pregnancySchedule.programId, programs.id))
      .where(
        and(
          eq(schema.pregnancySchedule.pregnancyMonth, month),
          isNull(programs.deletedAt)
        )
      )
      .orderBy(sql`${schema.pregnancySchedule.week} ASC, ${schema.pregnancySchedule.day} ASC`);
  }

  async findAllSchedules() {
    return this.db
      .select({
        scheduleId: schema.pregnancySchedule.id,
        programId: schema.pregnancySchedule.programId,
        pregnancyMonth: schema.pregnancySchedule.pregnancyMonth,
        week: schema.pregnancySchedule.week,
        day: schema.pregnancySchedule.day,
        unlockAfterDays: schema.pregnancySchedule.unlockAfterDays,
        isRequired: schema.pregnancySchedule.isRequired,
        program: programs,
      })
      .from(schema.pregnancySchedule)
      .innerJoin(programs, eq(schema.pregnancySchedule.programId, programs.id))
      .where(isNull(programs.deletedAt))
      .orderBy(sql`${schema.pregnancySchedule.week} ASC, ${schema.pregnancySchedule.day} ASC`);
  }

  async createScheduleEntry(data: {
    id: string;
    programId: string;
    pregnancyMonth: number;
    week: number;
    day: number;
    unlockAfterDays: number;
    isRequired: number;
    createdAt: number;
    updatedAt: number;
  }) {
    await this.db.insert(schema.pregnancySchedule).values(data);
  }

  async updateScheduleEntry(
    id: string,
    data: Partial<{
      programId: string;
      pregnancyMonth: number;
      week: number;
      day: number;
      unlockAfterDays: number;
      isRequired: number;
      updatedAt: number;
    }>
  ) {
    await this.db
      .update(schema.pregnancySchedule)
      .set(data)
      .where(eq(schema.pregnancySchedule.id, id));
  }

  async deleteScheduleEntry(id: string) {
    await this.db
      .delete(schema.pregnancySchedule)
      .where(eq(schema.pregnancySchedule.id, id));
  }

  // ── Program Progress ──────────────────────────────────

  async findProgress(userId: string, programId: string) {
    const result = await this.db
      .select()
      .from(schema.programProgress)
      .where(
        and(
          eq(schema.programProgress.userId, userId),
          eq(schema.programProgress.programId, programId)
        )
      )
      .limit(1);
    return result[0] ?? null;
  }

  async upsertProgress(data: {
    id: string;
    userId: string;
    programId: string;
    completedTracks: string; // JSON string
    progressPercentage: number;
    startedAt: number;
    completedAt?: number | null;
    updatedAt: number;
  }) {
    const existing = await this.findProgress(data.userId, data.programId);
    if (existing) {
      await this.db
        .update(schema.programProgress)
        .set({
          completedTracks: data.completedTracks,
          progressPercentage: data.progressPercentage,
          completedAt: data.completedAt,
          updatedAt: data.updatedAt,
        })
        .where(eq(schema.programProgress.id, existing.id));
      return existing.id;
    } else {
      await this.db.insert(schema.programProgress).values(data);
      return data.id;
    }
  }

  // ── User Profiles Pregnancy Calc ──────────────────────

  async findUserProfileByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async updateUserProfilePregnancyInfo(
    userId: string,
    data: {
      pregnancyEdd: string | null;
      pregnancyWeekStart: number | null;
      pregnancyWeekStartWeek: number | null;
      updatedAt: number;
    }
  ) {
    await this.db
      .update(schema.userProfiles)
      .set(data)
      .where(eq(schema.userProfiles.userId, userId));
  }
}

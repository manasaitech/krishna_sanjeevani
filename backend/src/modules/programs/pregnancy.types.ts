export interface PregnancyUserInfoInput {
  edd?: string | null; // ISO date string "YYYY-MM-DD"
  currentWeek?: number | null; // week number (1 to 40)
}

export interface PregnancyScheduleInput {
  programId: string;
  pregnancyMonth: number; // 1 to 9
  week: number; // 1 to 40
  day: number; // 1 to 7
  unlockAfterDays?: number;
  isRequired?: number; // 0 or 1
}

export interface UpdatePregnancyScheduleInput {
  programId?: string;
  pregnancyMonth?: number;
  week?: number;
  day?: number;
  unlockAfterDays?: number;
  isRequired?: number; // 0 or 1
}

export interface PregnancyCalculatedWeek {
  week: number;
  day: number;
  month: number;
  source: "edd" | "manual" | "none";
}

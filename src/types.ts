export interface CanonicalRecord {
  semester: string; targetClass: string; schoolFaculty: string; expectedSemester: string; courseCode: string;
  courseName: string; courseNameEnglish: string; credits: number | null; sectionId: string; group: string;
  componentType: string; day: number | null; slot: number | null;
  startPeriod: number | null; endPeriod: number | null; room: string; lecturer: string;
  startTime?: string; endTime?: string;
  capacity: number | null; lectureHours: number | null; practiceHours: number | null; note: string;
  lecturers?: string[]; shift?: string; weekExpression?: string; weeks?: number[] | null;
  sourceRow?: number; sourceData?: Record<string,string>;
}
export interface Meeting { id: string; componentType: string; group: string; day: number | null; slot: number | null; startPeriod: number | null; endPeriod: number | null; startTime?: string; endTime?: string; room: string; lecturer: string; lecturers: string[]; note: string; shift: string; weekExpression: string; weeks: number[] | null; occupiesSlot: boolean }
export interface Section { id: string; optionId?: string; courseCode: string; courseName: string; courseNameEnglish: string; targetClass: string; schoolFaculty: string; group: string; capacity: number | null; meetings: Meeting[] }
export interface Course { code: string; name: string; nameEnglish: string; credits: number | null; semester: string; targetClass: string; schoolFaculty: string; expectedSemester: string; sections: Section[] }
export interface Schedule { sections: Section[] }
export interface Diagnostics { reason: string; details: string[] }
export interface ScheduleFilters { excludedDays: number[]; excludedSlots: number[]; timeOfDay: 'all'|'morning'|'afternoon'|'evening' }

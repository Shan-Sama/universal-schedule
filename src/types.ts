export interface CanonicalRecord {
  semester: string; targetClass: string; schoolFaculty: string; expectedSemester: string; courseCode: string;
  courseName: string; credits: number | null; sectionId: string; group: string;
  componentType: string; day: number | null; slot: number | null;
  startPeriod: number | null; endPeriod: number | null; room: string; lecturer: string;
  capacity: number | null; lectureHours: number | null; practiceHours: number | null; note: string;
  lecturers?: string[]; shift?: string; weekExpression?: string; weeks?: number[] | null;
  sourceRow?: number; sourceData?: Record<string,string>;
}
export interface Meeting { id: string; componentType: string; day: number | null; slot: number | null; startPeriod: number | null; endPeriod: number | null; room: string; lecturer: string; lecturers: string[]; note: string; shift: string; weekExpression: string; weeks: number[] | null; occupiesSlot: boolean }
export interface Section { id: string; courseCode: string; targetClass: string; schoolFaculty: string; group: string; capacity: number | null; meetings: Meeting[] }
export interface Course { code: string; name: string; credits: number | null; semester: string; targetClass: string; schoolFaculty: string; expectedSemester: string; sections: Section[] }
export interface Schedule { sections: Section[] }
export interface Diagnostics { reason: string; details: string[] }
export interface ScheduleFilters { excludedDays: number[]; excludedSlots: number[]; timeOfDay: 'all'|'morning'|'afternoon' }

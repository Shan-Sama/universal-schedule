import { formatGroup } from './scheduler';
import type { Meeting, Section } from './types';

export function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function groupDisplay(value: string) {
  return formatGroup(value);
}

export function sectionOrigin(section: Section) {
  return [section.targetClass && `Lớp/Khóa: ${section.targetClass}`, section.schoolFaculty && `Trường/Viện/Khoa: ${section.schoolFaculty}`].filter(Boolean).join(' · ');
}

export function meetingCompact(meeting: Meeting) {
  const time = meeting.occupiesSlot ? `T${meeting.day}(${meeting.startPeriod}–${meeting.endPeriod})` : (meeting.componentType === 'ONL' ? 'ONL' : 'Không chiếm lịch');
  const group = groupDisplay(meeting.group);
  return [time, meeting.componentType, group, meeting.room, `GV: ${meeting.lecturer || 'Chưa có'}`].filter(Boolean).join(' · ');
}

export function sectionDetails(section: Section) {
  const lecture: string[] = []; const practice: string[] = []; const other: string[] = [];
  section.meetings.forEach(meeting => {
    const line = meetingCompact(meeting); const type = meeting.componentType.toUpperCase();
    if (/BT|TH|TN/.test(type)) practice.push(line);
    else if (/LT/.test(type)) lecture.push(line);
    else other.push(line);
  });
  return { lecture, practice, other };
}

export function sectionSummary(section: Section) {
  const details = sectionDetails(section); const schedule = [...details.lecture, ...details.practice, ...details.other].join(' | ');
  return [sectionOrigin(section), schedule].filter(Boolean).join(' · ');
}

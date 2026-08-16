import type { CanonicalRecord, Course, Diagnostics, Schedule, ScheduleFilters, Section } from './types';
export const MAX_SCHEDULES=200;
export function groupRecords(records: CanonicalRecord[]): Course[] {
 const courses=new Map<string,Course>();
 records.forEach((r,index)=>{ let c=courses.get(r.courseCode); if(!c){c={code:r.courseCode,name:r.courseName,credits:r.credits,semester:r.semester,targetClass:r.targetClass,schoolFaculty:r.schoolFaculty,expectedSemester:r.expectedSemester,sections:[]};courses.set(r.courseCode,c)}
  let s=c.sections.find(x=>x.id===r.sectionId); if(!s){s={id:r.sectionId,courseCode:r.courseCode,targetClass:r.targetClass,schoolFaculty:r.schoolFaculty,group:r.group,capacity:r.capacity,meetings:[]};c.sections.push(s)}
  const occupiesSlot=r.componentType!=='ONL' && r.day!==null && r.startPeriod!==null && r.endPeriod!==null;
  s.meetings.push({id:`${r.sectionId}-${index}`,componentType:r.componentType,day:r.day,slot:r.slot,startPeriod:r.startPeriod,endPeriod:r.endPeriod,room:r.room,lecturer:r.lecturer,lecturers:r.lecturers??(r.lecturer?[r.lecturer]:[]),note:r.note,shift:r.shift??'',weekExpression:r.weekExpression??'',weeks:r.weeks??null,occupiesSlot});
 }); return [...courses.values()];
}
const weeksOverlap=(a:number[]|null,b:number[]|null)=>!a||!b||a.some(week=>b.includes(week));
export const sectionsConflict=(a:Section,b:Section)=>a.meetings.some(x=>x.occupiesSlot&&b.meetings.some(y=>y.occupiesSlot&&x.day===y.day&&(x.startPeriod!<=y.endPeriod!&&y.startPeriod!<=x.endPeriod!)&&weeksOverlap(x.weeks,y.weeks)));
const sectionMatchesFilters=(section:Section,filters:ScheduleFilters)=>section.meetings.every(meeting=>{
 if(!meeting.occupiesSlot)return true;
 if(filters.excludedDays.includes(meeting.day!))return false;
 if(filters.excludedSlots.some(slot=>meeting.startPeriod!<=slot*3&&meeting.endPeriod!>=(slot-1)*3+1))return false;
 if(filters.timeOfDay==='morning'&&meeting.endPeriod!>6)return false;
 if(filters.timeOfDay==='afternoon'&&meeting.startPeriod!<7)return false;
 return true;
});
export function findSchedules(courses:Course[],selected:Set<string>,allowedSections:Record<string,string[]>,filters:ScheduleFilters={excludedDays:[],excludedSlots:[],timeOfDay:'all'},max=MAX_SCHEDULES):{schedules:Schedule[],diagnostics?:Diagnostics}{
 const chosen=courses.filter(c=>selected.has(c.code)&&allowedSections[c.code]?.length!==0); const schedules:Schedule[]=[];
 if(selected.size&&!chosen.length)return {schedules,diagnostics:{reason:'Chưa có học phần nào đang bật để xếp lịch.',details:['Môn đã bỏ chọn toàn bộ lớp vẫn được lưu nhưng đang ở trạng thái tạm không xếp.']}};
 const optionsByCourse=new Map(chosen.map(course=>{const allowed=allowedSections[course.code];const options=course.sections.filter(section=>(!allowed||allowed.includes(section.id))&&sectionMatchesFilters(section,filters));return [course.code,options] as const}));
 const empty=chosen.filter(course=>!optionsByCourse.get(course.code)?.length);if(empty.length)return {schedules,diagnostics:{reason:'Một số học phần không còn section phù hợp.',details:empty.map(course=>`${course.code}: hãy chọn thêm section hoặc nới bộ lọc.`)}};
 const dfs=(i:number,picked:Section[])=>{if(schedules.length>=max)return;if(i===chosen.length){schedules.push({sections:[...picked]});return} const course=chosen[i]; const options=optionsByCourse.get(course.code)??[];
  options.forEach(s=>{if(!picked.some(p=>sectionsConflict(p,s))){picked.push(s);dfs(i+1,picked);picked.pop()}})}; dfs(0,[]);
 if(schedules.length||!chosen.length)return {schedules};
 const details:string[]=[]; chosen.forEach((a,i)=>chosen.slice(i+1).forEach(b=>{const aOptions=optionsByCourse.get(a.code)??[];const bOptions=optionsByCourse.get(b.code)??[];const pairs=aOptions.flatMap(sa=>bOptions.filter(sb=>sectionsConflict(sa,sb)).map(sb=>`${sa.id} ↔ ${sb.id}`));if(pairs.length)details.push(`${a.code} và ${b.code}: ${pairs.join(', ')}`)}));
 return {schedules,diagnostics:{reason:'Không tìm được tổ hợp section không trùng lịch.',details:details.length?details:['Hãy chọn thêm section, nới bộ lọc hoặc giảm số học phần.']}};
}

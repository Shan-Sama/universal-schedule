import type { CanonicalRecord, Course, Diagnostics, Schedule, ScheduleFilters, Section } from './types';
export const MAX_SCHEDULES=200;

const plain=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').trim().toUpperCase();
export function formatGroup(value:string){
 const group=value.trim();if(!group)return '';
 const normalized=plain(group).replace(/\s+/g,'');
 if(['CL','CALOP','ALL'].includes(normalized))return 'CL';
 if(/^N?\d+$/.test(normalized))return `N${normalized.replace(/^N/,'')}`;
 return group.toUpperCase();
}
const isWholeClassGroup=(value:string)=>{const group=formatGroup(value);return !group||group==='CL'};
export const sectionOptionId=(section:Section)=>section.optionId??section.id;

export function groupRecords(records: CanonicalRecord[]): Course[] {
 const courseRows=new Map<string,{record:CanonicalRecord;index:number}[]>();
 records.forEach((record,index)=>courseRows.set(record.courseCode,[...(courseRows.get(record.courseCode)??[]),{record,index}]));
 return [...courseRows.entries()].map(([courseCode,rows])=>{
  const first=rows[0].record;
  const course:Course={code:courseCode,name:first.courseName,nameEnglish:first.courseNameEnglish,credits:first.credits,semester:first.semester,targetClass:first.targetClass,schoolFaculty:first.schoolFaculty,expectedSemester:first.expectedSemester,sections:[]};
  const sectionRows=new Map<string,typeof rows>();
  rows.forEach(item=>sectionRows.set(item.record.sectionId,[...(sectionRows.get(item.record.sectionId)??[]),item]));
  sectionRows.forEach((items,sectionId)=>{
   const common=items.filter(item=>isWholeClassGroup(item.record.group));
   const subgroupCodes=[...new Set(items.map(item=>formatGroup(item.record.group)).filter(group=>group&&group!=='CL'))];
   const alternatives=subgroupCodes.length?subgroupCodes.map(group=>({group,items:[...common,...items.filter(item=>formatGroup(item.record.group)===group)]})):[{group:formatGroup(items[0].record.group),items}];
   alternatives.forEach(alternative=>{
    const subgroupRecord=alternative.items.find(item=>formatGroup(item.record.group)===alternative.group)?.record;
    const sectionRecord=subgroupRecord??alternative.items[0].record;
    const meetings=alternative.items.map(({record,index})=>{
     const occupiesSlot=record.componentType!=='ONL'&&record.day!==null&&record.startPeriod!==null&&record.endPeriod!==null;
     return {id:`${sectionId}-${alternative.group||'CL'}-${index}`,componentType:record.componentType,group:formatGroup(record.group),day:record.day,slot:record.slot,startPeriod:record.startPeriod,endPeriod:record.endPeriod,room:record.room,lecturer:record.lecturer,lecturers:record.lecturers??(record.lecturer?[record.lecturer]:[]),note:record.note,shift:record.shift??'',weekExpression:record.weekExpression??'',weeks:record.weeks??null,occupiesSlot};
    });
    course.sections.push({id:sectionId,optionId:subgroupCodes.length?`${sectionId}::${alternative.group}`:sectionId,courseCode,courseName:sectionRecord.courseName,courseNameEnglish:sectionRecord.courseNameEnglish,targetClass:sectionRecord.targetClass,schoolFaculty:sectionRecord.schoolFaculty,group:alternative.group||'CL',capacity:sectionRecord.capacity,meetings});
   });
  });
  return course;
 });
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
 const optionsByCourse=new Map(chosen.map(course=>{const allowed=allowedSections[course.code];const options=course.sections.filter(section=>(!allowed||allowed.includes(sectionOptionId(section)))&&sectionMatchesFilters(section,filters));return [course.code,options] as const}));
 const empty=chosen.filter(course=>!optionsByCourse.get(course.code)?.length);if(empty.length)return {schedules,diagnostics:{reason:'Một số học phần không còn section phù hợp.',details:empty.map(course=>`${course.code}: hãy chọn thêm section hoặc nới bộ lọc.`)}};
 const dfs=(i:number,picked:Section[])=>{if(schedules.length>=max)return;if(i===chosen.length){schedules.push({sections:[...picked]});return} const course=chosen[i]; const options=optionsByCourse.get(course.code)??[];
  options.forEach(s=>{if(!picked.some(p=>sectionsConflict(p,s))){picked.push(s);dfs(i+1,picked);picked.pop()}})}; dfs(0,[]);
 if(schedules.length||!chosen.length)return {schedules};
 const details:string[]=[]; chosen.forEach((a,i)=>chosen.slice(i+1).forEach(b=>{const aOptions=optionsByCourse.get(a.code)??[];const bOptions=optionsByCourse.get(b.code)??[];const pairs=aOptions.flatMap(sa=>bOptions.filter(sb=>sectionsConflict(sa,sb)).map(sb=>`${sa.id} ↔ ${sb.id}`));if(pairs.length)details.push(`${a.code} và ${b.code}: ${pairs.join(', ')}`)}));
 return {schedules,diagnostics:{reason:'Không tìm được tổ hợp section không trùng lịch.',details:details.length?details:['Hãy chọn thêm section, nới bộ lọc hoặc giảm số học phần.']}};
}

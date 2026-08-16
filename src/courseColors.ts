import type {CSSProperties} from 'react';

export type CourseColorAssignments=Record<string,number>;
type CoursePastel={background:string;border:string;ink:string};

// Hai mươi màu nền khác nhau được cấp ngẫu nhiên nhưng không lặp giữa các môn đang chọn.
export const COURSE_PASTELS:CoursePastel[]=[
  {background:'#ffdce5',border:'#dc8ea2',ink:'#603140'},
  {background:'#ffdcd3',border:'#dc917e',ink:'#61372d'},
  {background:'#ffe6cf',border:'#dba372',ink:'#5f4026'},
  {background:'#fff0c5',border:'#d7b958',ink:'#594816'},
  {background:'#f8f2bd',border:'#c8bd52',ink:'#51501b'},
  {background:'#eaf2c7',border:'#a9bd62',ink:'#425022'},
  {background:'#dff1d5',border:'#83bc77',ink:'#2e5130'},
  {background:'#d6f1e2',border:'#72bd95',ink:'#28513d'},
  {background:'#d4f0ec',border:'#6eb9ad',ink:'#28504b'},
  {background:'#d6eef5',border:'#75b5c6',ink:'#274c57'},
  {background:'#dce9fa',border:'#82a9d6',ink:'#2d4666'},
  {background:'#dfe3fa',border:'#919bd3',ink:'#393f68'},
  {background:'#e7dffa',border:'#a28bd1',ink:'#463866'},
  {background:'#efddf8',border:'#b489ca',ink:'#513661'},
  {background:'#f7dcf1',border:'#ca88b7',ink:'#5e3656'},
  {background:'#f9dce8',border:'#d08ea7',ink:'#603747'},
  {background:'#eadfda',border:'#ad968a',ink:'#4f4039'},
  {background:'#e2e8d8',border:'#94aa7c',ink:'#3d4b32'},
  {background:'#dde9e7',border:'#83aaa4',ink:'#344c49'},
  {background:'#e2e5eb',border:'#939eaf',ink:'#3d4553'},
];

function generatedOverflowColor(index:number):CoursePastel{
  const hue=Math.round(((index-COURSE_PASTELS.length)*137.508)%360);
  return {background:`hsl(${hue} 68% 90%)`,border:`hsl(${hue} 42% 62%)`,ink:`hsl(${hue} 35% 27%)`};
}

export function assignCourseColor(assignments:CourseColorAssignments,courseCode:string,random:()=>number=Math.random):CourseColorAssignments{
  if(Object.hasOwn(assignments,courseCode))return assignments;
  const used=new Set(Object.values(assignments));
  const available=COURSE_PASTELS.map((_,index)=>index).filter(index=>!used.has(index));
  const colorIndex=available.length
    ?available[Math.min(available.length-1,Math.floor(random()*available.length))]
    :Array.from({length:used.size+1},(_,index)=>index).find(index=>!used.has(index))!;
  return {...assignments,[courseCode]:colorIndex};
}

export function assignCourseColors(assignments:CourseColorAssignments,courseCodes:string[],random:()=>number=Math.random):CourseColorAssignments{
  return courseCodes.reduce((current,courseCode)=>assignCourseColor(current,courseCode,random),assignments);
}

export function releaseCourseColor(assignments:CourseColorAssignments,courseCode:string):CourseColorAssignments{
  if(!Object.hasOwn(assignments,courseCode))return assignments;
  const next={...assignments};
  delete next[courseCode];
  return next;
}

export function courseStyle(colorIndex:number|undefined):CSSProperties{
  if(colorIndex===undefined)return {};
  const color=COURSE_PASTELS[colorIndex]??generatedOverflowColor(colorIndex);
  return {'--course-bg':color.background,'--course-border':color.border,'--course-ink':color.ink} as CSSProperties;
}

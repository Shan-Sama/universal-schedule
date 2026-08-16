import type { CanonicalRecord } from './types';
const base = { semester:'20261', schoolFaculty:'Trường Đại học Công nghệ', expectedSemester:'7', courseCode:'ELT3297', courseName:'Lập trình điều khiển thiết bị', credits:3, group:'CL', capacity:57, lectureHours:30, practiceHours:30, note:'' };
export const mockRecords: CanonicalRecord[] = [
  {...base,targetClass:'K68E-CE-VM+K68E-CE-IoT1',sectionId:'ELT3297 1',componentType:'LT',day:6,slot:4,startPeriod:10,endPeriod:12,room:'106-A',lecturer:'Hoàng Gia Hưng'},
  {...base,targetClass:'K68E-CE-VM+K68E-CE-IoT',sectionId:'ELT3297 1',componentType:'BT',day:5,slot:1,startPeriod:1,endPeriod:3,room:'108-B',lecturer:'Dương Minh Ngọc'},
  {...base,targetClass:'K68E-CE1-TM+K68E-CE-IoT',sectionId:'ELT3297 2',componentType:'LT',day:5,slot:4,startPeriod:10,endPeriod:12,room:'203-B',lecturer:'Hoàng Gia Hưng'},
  {...base,targetClass:'K68E-CE1-TM+K68E-CE-IoT2',sectionId:'ELT3297 2',componentType:'BT',day:4,slot:4,startPeriod:10,endPeriod:12,room:'308-B',lecturer:'Đỗ Đình Minh'},
  {semester:'20261',targetClass:'K68E',schoolFaculty:'Trường Đại học Công nghệ',expectedSemester:'7',courseCode:'INT3306',courseName:'Phát triển ứng dụng Web',credits:3,sectionId:'INT3306 1',group:'CL',componentType:'LT',day:3,slot:2,startPeriod:4,endPeriod:6,room:'201-G2',lecturer:'Nguyễn Văn An',capacity:60,lectureHours:30,practiceHours:30,note:''},
  {semester:'20261',targetClass:'K68E',schoolFaculty:'Trường Đại học Công nghệ',expectedSemester:'7',courseCode:'INT3306',courseName:'Phát triển ứng dụng Web',credits:3,sectionId:'INT3306 2',group:'CL',componentType:'LT',day:6,slot:4,startPeriod:10,endPeriod:12,room:'202-G2',lecturer:'Trần Thu Hà',capacity:60,lectureHours:30,practiceHours:30,note:''},
  {semester:'20261',targetClass:'K68E',schoolFaculty:'Trường Đại học Công nghệ',expectedSemester:'7',courseCode:'ELT4007',courseName:'Dự án ngành Kỹ thuật máy tính',credits:4,sectionId:'ELT4007 1',group:'CL',componentType:'ONL',day:null,slot:null,startPeriod:null,endPeriod:null,room:'',lecturer:'Khoa ĐTVT',capacity:10,lectureHours:null,practiceHours:60,note:'Học trực tuyến, không chiếm lịch'}
];

import * as XLSX from 'xlsx';
import type { CanonicalRecord } from './types';

export type CanonicalKey=Exclude<keyof CanonicalRecord,'sourceRow'|'sourceData'|'lecturers'|'weeks'>;
export type MappingKey=CanonicalKey|'periodExpression'|'timeExpression'|'workloadExpression';
export type ColumnMapping=Partial<Record<MappingKey,number|null>>;
export interface SourceColumn{index:number;excelColumn:string;label:string}
export interface ExcelWorkbookDraft{fileName:string;sheetNames:string[];suggestedSheet:string;workbook:XLSX.WorkBook}
export interface ExcelDraft{fileName:string;sheetName:string;sheetNames:string[];headerRow:number;columns:SourceColumn[];rows:unknown[][];mapping:ColumnMapping;detectedFormat:string}
export interface ValidationIssue{rowNumber:number;messages:string[]}
export interface IgnoredRow{rowNumber:number;reason:string}

export const fieldDefinitions:{key:MappingKey;label:string;required?:boolean;aliases:string[]}[]=[
  {key:'semester',label:'Kỳ học',aliases:['Kỳ','Ky','Học kỳ','Hoc ky','Semester']},
  {key:'targetClass',label:'Lớp/Khóa',aliases:['Lớp','Lop','Lớp SV','Lop SV','Khóa','Khoa']},
  {key:'schoolFaculty',label:'Trường/Viện/Khoa',aliases:['Trường_Viện_Khoa','Truong_Vien_Khoa','Trường_Việt_Khoa','Truong_Viet_Khoa','Trường Viện Khoa','Truong Vien Khoa','Trường/Viện/Khoa','Truong/Vien/Khoa','Viện/Khoa','Vien/Khoa']},
  {key:'expectedSemester',label:'HK dự kiến',aliases:['HK dự kiến','HK du kien']},
  {key:'courseCode',label:'Mã HP',required:true,aliases:['Mã HP','Ma HP','Mã_HP','Mã học phần','Ma hoc phan','Mã môn','Ma mon']},
  {key:'courseName',label:'Tên học phần',aliases:['Môn','Mon','Tên HP','Ten HP','Tên_HP','Tên học phần','Ten hoc phan','Tên môn','Ten mon']},
  {key:'courseNameEnglish',label:'Tên học phần tiếng Anh',aliases:['Tên_HP_Tiếng_Anh','Tên HP Tiếng Anh','Tên học phần tiếng Anh','Tên môn tiếng Anh','Ten HP Tieng Anh','Ten hoc phan tieng Anh','English name','Course name English','Course name (English)']},
  {key:'credits',label:'Tín chỉ',aliases:['TC','Tín chỉ','Tin chi','Số TC','So TC']},
  {key:'workloadExpression',label:'Khối lượng HUST',aliases:['Khối_lượng','Khối lượng','Khoi_luong','Khoi luong','Khối lượng học tập','Khoi luong hoc tap']},
  {key:'sectionId',label:'Mã LHP/Mã lớp',aliases:['Mã LHP','Ma LHP','Mã_lớp','Mã lớp học phần','Ma lop hoc phan','Mã lớp HP','Ma lop HP','Mã lớp','Ma lop']},
  {key:'group',label:'Nhóm',aliases:['Nhóm','Nhom','Nhóm lớp','Nhom lop']},
  {key:'componentType',label:'Loại buổi',aliases:['LT/BT/TH','LT/TH/BT','Loại_lớp','Loại lớp','Loai lop','Loại buổi','Loai buoi','Loại hình','Loai hinh']},
  {key:'day',label:'Thứ',aliases:['Thứ','Thu','Ngày học','Ngay hoc']},
  {key:'timeExpression',label:'Thời gian cụ thể',aliases:['Thời_gian','Thời gian','Thoi_gian','Thoi gian','Giờ học','Gio hoc','Khung giờ','Khung gio']},
  {key:'periodExpression',label:'Tiết (chuỗi)',aliases:['Tiết','Tiet','Tiết học','Tiet hoc','Tiết BD-KT','Tiet BD-KT']},
  {key:'slot',label:'Ca (chuỗi)',aliases:['Ca','Ca học','Ca hoc']},
  {key:'startPeriod',label:'Tiết bắt đầu',aliases:['BĐ','BD','Bắt đầu','Bat dau','Từ tiết','Tu tiet']},
  {key:'endPeriod',label:'Tiết kết thúc',aliases:['KT','Kết thúc','Ket thuc','Đến tiết','Den tiet']},
  {key:'shift',label:'Kíp (Sáng/Chiều/Tối)',aliases:['Kíp','Kip','Buổi học','Buoi hoc']},
  {key:'weekExpression',label:'Tuần học',aliases:['Tuần','Tuan','Tuần học','Tuan hoc']},
  {key:'room',label:'Địa điểm học (GĐ/Phòng)',aliases:['GĐ','GD','Phòng','Phong','Giảng đường','Giang duong','Địa điểm','Dia diem']},
  {key:'lecturer',label:'Giảng viên',aliases:['Giảng viên','Giang vien','GV','Cán bộ','Can bo','GV (theo phân công)']},
  {key:'capacity',label:'Sĩ số lớp',aliases:['SS lớp','SS lop','Sĩ số','Si so','SL lớp học','SL lop hoc','Số lượng','So luong','SL_Max']},
  {key:'lectureHours',label:'Số giờ LT',aliases:['LT','Giờ LT','Gio LT']},
  {key:'practiceHours',label:'Số giờ BT/TH',aliases:['BT/TH','BT TH','TH','Giờ TH','Gio TH']},
  {key:'note',label:'Ghi chú',aliases:['Ghi chú học','Ghi chu hoc','Ghi_chú','Ghi chú','Ghi chu','Chú ý','Chu y']},
  {key:'startTime',label:'Giờ bắt đầu',aliases:[]},
  {key:'endTime',label:'Giờ kết thúc',aliases:[]},
];

const clean=(value:unknown)=>String(value??'').trim();
const plain=(value:unknown)=>clean(value).toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const normalized=(value:unknown)=>plain(value).replace(/[^a-z0-9]/g,'');
const isMissingValue=(value:unknown)=>{const text=normalized(value);return !text||['null','undefined','na','none'].includes(text)};
const numberOrNull=(value:unknown)=>{const text=clean(value);if(!text)return null;const number=Number(text.replace(',','.'));return Number.isFinite(number)?number:null};

export interface HustWorkload{expression:string;credits:number|null;lecturePeriods:number|null;exercisePeriods:number|null;practicePeriods:number|null;selfStudyPeriods:number|null;error?:string}
export function parseHustWorkload(value:unknown):HustWorkload{
  const expression=clean(value);const empty={expression,credits:null,lecturePeriods:null,exercisePeriods:null,practicePeriods:null,selfStudyPeriods:null};if(isMissingValue(value))return empty;
  const match=expression.replace(/[–—]/g,'-').match(/^(\d+(?:[.,]\d+)?)\s*(?:\(\s*(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s*\))?$/);
  if(!match)return {...empty,error:`“${expression}” không đúng dạng 2(2-1-0-4)`};
  const toNumber=(text?:string)=>{if(!text)return null;const parsed=Number(text.replace(',','.'));return Number.isFinite(parsed)?parsed:null};
  return {expression,credits:toNumber(match[1]),lecturePeriods:toNumber(match[2]),exercisePeriods:toNumber(match[3]),practicePeriods:toNumber(match[4]),selfStudyPeriods:toNumber(match[5])};
}

export const HUST_PERIOD_TIMES=[
  {period:1,start:'06:45',end:'07:30',startMinutes:405,endMinutes:450},
  {period:2,start:'07:30',end:'08:15',startMinutes:450,endMinutes:495},
  {period:3,start:'08:25',end:'09:10',startMinutes:505,endMinutes:550},
  {period:4,start:'09:20',end:'10:05',startMinutes:560,endMinutes:605},
  {period:5,start:'10:15',end:'11:00',startMinutes:615,endMinutes:660},
  {period:6,start:'11:00',end:'11:45',startMinutes:660,endMinutes:705},
  {period:7,start:'12:30',end:'13:15',startMinutes:750,endMinutes:795},
  {period:8,start:'13:15',end:'14:00',startMinutes:795,endMinutes:840},
  {period:9,start:'14:10',end:'14:55',startMinutes:850,endMinutes:895},
  {period:10,start:'15:05',end:'15:50',startMinutes:905,endMinutes:950},
  {period:11,start:'16:00',end:'16:45',startMinutes:960,endMinutes:1005},
  {period:12,start:'16:45',end:'17:30',startMinutes:1005,endMinutes:1050},
  {period:13,start:'17:45',end:'18:30',startMinutes:1065,endMinutes:1110},
  {period:14,start:'18:30',end:'19:15',startMinutes:1110,endMinutes:1155},
] as const;

export function parseClockMinutes(value:unknown):number|null{
  if(isMissingValue(value))return null;
  if(typeof value==='number'&&value>0&&value<1)return Math.round(value*24*60);
  const text=clean(value);if(!text)return null;let hour:number;let minute:number;
  const separated=text.match(/^(\d{1,2})\s*(?::|h|H)\s*(\d{1,2})$/);
  if(separated){hour=Number(separated[1]);minute=Number(separated[2])}
  else {const digits=text.replace(/\s+/g,'');if(!/^\d{3,4}$/.test(digits))return null;hour=Number(digits.slice(0,-2));minute=Number(digits.slice(-2))}
  return hour>=0&&hour<=23&&minute>=0&&minute<=59?hour*60+minute:null;
}

const formatClock=(minutes:number)=>`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
export function clockRangeToPeriods(startValue:unknown,endValue:unknown):{startPeriod:number|null;endPeriod:number|null;startTime:string;endTime:string;error?:string}{
  const startMinutes=parseClockMinutes(startValue);const endMinutes=parseClockMinutes(endValue);
  if(startMinutes===null||endMinutes===null)return {startPeriod:null,endPeriod:null,startTime:'',endTime:'',error:'Giờ BĐ/KT phải đủ và có dạng 0700, 07:00 hoặc 7h00'};
  if(startMinutes===endMinutes)return {startPeriod:null,endPeriod:null,startTime:'',endTime:''};
  if(startMinutes>endMinutes)return {startPeriod:null,endPeriod:null,startTime:formatClock(startMinutes),endTime:formatClock(endMinutes),error:'Giờ bắt đầu phải nhỏ hơn giờ kết thúc'};
  const occupied=HUST_PERIOD_TIMES.filter(period=>startMinutes<period.endMinutes&&endMinutes>period.startMinutes);
  if(!occupied.length)return {startPeriod:null,endPeriod:null,startTime:formatClock(startMinutes),endTime:formatClock(endMinutes),error:'Khoảng giờ không giao với tiết 1–14 của HUST'};
  return {startPeriod:occupied[0].period,endPeriod:occupied[occupied.length-1].period,startTime:formatClock(startMinutes),endTime:formatClock(endMinutes)};
}

export function parseClockRangeExpression(value:unknown):{startPeriod:number|null;endPeriod:number|null;startTime:string;endTime:string;error?:string}{
  const expression=clean(value);if(isMissingValue(value))return {startPeriod:null,endPeriod:null,startTime:'',endTime:''};
  const match=expression.replace(/[–—]/g,'-').match(/^\s*([^\s-]+)\s*-\s*([^\s-]+)\s*$/);
  if(!match)return {startPeriod:null,endPeriod:null,startTime:'',endTime:'',error:`“${expression}” phải có dạng 0645-0910 hoặc 06:45-09:10`};
  if(parseClockMinutes(match[1])===0&&parseClockMinutes(match[2])===0)return {startPeriod:null,endPeriod:null,startTime:'',endTime:''};
  return clockRangeToPeriods(match[1],match[2]);
}
const dayOrNull=(value:unknown)=>{const text=clean(value);if(!text)return null;const direct=numberOrNull(value);if(direct!==null)return direct;const match=plain(text).match(/(?:thu|t)\s*([2-7])/);return match?Number(match[1]):null};
const excelColumn=(index:number)=>{let result='';for(let n=index+1;n>0;n=Math.floor((n-1)/26))result=String.fromCharCode(65+(n-1)%26)+result;return result};

export const slotToPeriods=(slot:number|null)=>slot&&slot>=1&&slot<=4?{start:(slot-1)*3+1,end:slot*3}:{start:null,end:null};

export function parseNumberExpression(value:unknown,min:number,max:number):{ranges:{start:number;end:number}[];error?:string}{
  const text=clean(value);if(!text)return {ranges:[]};const ranges:{start:number;end:number}[]=[];
  const tokens=text.replace(/[–—]/g,'-').split(/[,;+\n]+/).map(token=>token.trim()).filter(Boolean);
  for(const token of tokens){const match=token.match(/^(\d+)\s*(?:-\s*(\d+))?$/);if(!match)return {ranges:[],error:`“${text}” không đúng dạng 1 - 5, 7 - 9`};const start=Number(match[1]);const end=Number(match[2]??match[1]);if(start<min||end>max||start>end)return {ranges:[],error:`“${token}” phải nằm trong ${min}–${max}`};ranges.push({start,end})}
  return {ranges};
}

export function splitLecturers(value:unknown){return clean(value).split(/\s*(?:,|\+|&|;|\||\n)\s*/).map(name=>name.trim()).filter(Boolean)}

export function parseWeekExpression(value:unknown):{expression:string;weeks:number[]|null;error?:string}{
  const expression=clean(value);if(!expression)return {expression:'',weeks:null};const text=plain(expression);
  const maxWeek=30;const sequence=(start:number,end:number,step=1)=>Array.from({length:Math.floor((end-start)/step)+1},(_,index)=>start+index*step);
  if(/tuan\s*chan/.test(text))return {expression,weeks:sequence(2,maxWeek,2)};
  if(/tuan\s*le/.test(text))return {expression,weeks:sequence(1,maxWeek-1,2)};
  const from=text.match(/tu\s*tuan\s*(\d+)/);if(from)return {expression,weeks:sequence(Number(from[1]),maxWeek)};
  const first=text.match(/(\d+)\s*tuan\s*dau/);if(first)return {expression,weeks:sequence(1,Number(first[1]))};
  if(/^\s*\d+\s*(?:-\s*\d+)?(?:\s*[,;+]\s*\d+\s*(?:-\s*\d+)?)*\s*$/.test(text)){const parsed=parseNumberExpression(text,1,53);if(parsed.error)return {expression,weeks:null,error:parsed.error};return {expression,weeks:[...new Set(parsed.ranges.flatMap(range=>sequence(range.start,range.end)))]}}
  const embeddedRanges=[...text.matchAll(/(\d+)\s*-\s*(\d+)/g)].map(match=>({start:Number(match[1]),end:Number(match[2])})).filter(range=>range.start>=1&&range.end<=53&&range.start<=range.end);
  if(embeddedRanges.length)return {expression,weeks:[...new Set(embeddedRanges.flatMap(range=>sequence(range.start,range.end)))]};
  return {expression,weeks:null};
}

function shiftOffset(value:unknown){const text=normalized(value);if(!text||text==='sang'||text==='am'||text==='1')return 0;if(text==='chieu'||text==='pm'||text==='2')return 6;if(text==='toi'||text==='evening'||text==='night'||text==='3')return 12;return null}
function guessMapping(headers:unknown[]):ColumnMapping{const mapping:ColumnMapping={};fieldDefinitions.forEach(field=>{const index=headers.findIndex(header=>field.aliases.some(alias=>normalized(alias)===normalized(header)));mapping[field.key]=index>=0?index:null});return mapping}
const headerScore=(row:unknown[])=>{const mapping=guessMapping(row);return fieldDefinitions.reduce((score,field)=>score+(mapping[field.key]!==null?1:0),0)};
const detectFormat=(headers:unknown[])=>{const keys=headers.map(normalized);const isUet=keys.includes('malhp')&&(keys.includes('ca')||keys.includes('gd'));const isHust=keys.includes('malop')&&keys.includes('bd')&&keys.includes('kt')&&keys.includes('kip');if(isUet)return 'UET/VNU';if(isHust)return 'HUST';return 'Tự động/khác'};

function findHeader(matrix:unknown[][]){const candidates=matrix.slice(0,50).map((row,index)=>({index,score:headerScore(row)})).sort((a,b)=>b.score-a.score);return candidates[0]?.score?candidates[0].index:0}
function previewMatrix(sheet:XLSX.WorkSheet){const range=XLSX.utils.decode_range(sheet['!ref']||'A1:A1');return XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',blankrows:true,range:{s:{r:0,c:0},e:{r:Math.min(range.e.r,49),c:Math.min(range.e.c,59)}}})}
function scoreSheet(sheet:XLSX.WorkSheet,name:string){const matrix=previewMatrix(sheet);const header=matrix[findHeader(matrix)]??[];const mapping=guessMapping(header);let score=headerScore(header)*10;if(typeof mapping.courseCode==='number')score+=50;if(typeof mapping.day==='number')score+=30;if(typeof mapping.slot==='number'||typeof mapping.periodExpression==='number'||typeof mapping.startPeriod==='number'&&typeof mapping.endPeriod==='number')score+=40;if(typeof mapping.sectionId==='number')score+=10;if(/tkb|thoi khoa bieu/i.test(plain(name)))score+=15;return score}

export async function readExcelWorkbook(file:File):Promise<ExcelWorkbookDraft>{
  const workbook=XLSX.read(await file.arrayBuffer());if(!workbook.SheetNames.length)throw new Error('Workbook không có sheet dữ liệu.');
  const suggestedSheet=[...workbook.SheetNames].sort((a,b)=>scoreSheet(workbook.Sheets[b],b)-scoreSheet(workbook.Sheets[a],a))[0];
  return {fileName:file.name,sheetNames:workbook.SheetNames,suggestedSheet,workbook};
}

export function createSheetDraft(source:ExcelWorkbookDraft,sheetName:string):ExcelDraft{
  const sheet=source.workbook.Sheets[sheetName];if(!sheet)throw new Error(`Không tìm thấy sheet “${sheetName}”.`);
  const matrix=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',blankrows:true});if(!matrix.length)throw new Error(`Sheet “${sheetName}” không có dữ liệu.`);
  const headerIndex=findHeader(matrix);const headers=matrix[headerIndex]??[];const rows=matrix.slice(headerIndex+1);const width=Math.max(headers.length,...rows.map(row=>row.length));
  const usedIndexes=Array.from({length:width},(_,index)=>index).filter(index=>clean(headers[index])||rows.some(row=>clean(row[index])));
  const columns=usedIndexes.map(index=>({index,excelColumn:excelColumn(index),label:clean(headers[index])||`Cột ${excelColumn(index)}`}));
  return {fileName:source.fileName,sheetName,sheetNames:source.sheetNames,headerRow:headerIndex+1,columns,rows,mapping:guessMapping(headers),detectedFormat:detectFormat(headers)};
}

export async function readExcelDraft(file:File){const source=await readExcelWorkbook(file);return createSheetDraft(source,source.suggestedSheet)}
function sourceData(draft:ExcelDraft,row:unknown[]){return Object.fromEntries(draft.columns.map(column=>[`${column.excelColumn} · ${column.label}`,clean(row[column.index])]))}

export function normalizeDraft(draft:ExcelDraft,mapping:ColumnMapping,fallbackSemester=''){
  const records:CanonicalRecord[]=[];const issues:ValidationIssue[]=[];const ignoredRows:IgnoredRow[]=[];
  const value=(row:unknown[],key:MappingKey)=>{const index=mapping[key];return typeof index==='number'?row[index]:undefined};
  draft.rows.forEach((row,rowIndex)=>{
    if(!row.some(cell=>clean(cell)))return;const rowNumber=draft.headerRow+rowIndex+1;const courseCode=clean(value(row,'courseCode'));
    if(!courseCode||['mahp','mahocphan','mamon'].includes(normalized(courseCode))){ignoredRows.push({rowNumber,reason:'Không có Mã HP hoặc là dòng header lặp/tổng'});return}
    const semester=clean(value(row,'semester'))||fallbackSemester;const courseName=clean(value(row,'courseName'))||courseCode;const courseNameEnglish=clean(value(row,'courseNameEnglish'));const group=clean(value(row,'group'));const sectionId=clean(value(row,'sectionId'))||[courseCode,group].filter(Boolean).join(' ')||courseCode;const componentType=clean(value(row,'componentType')).toUpperCase();const day=dayOrNull(value(row,'day'));const rawSource=sourceData(draft,row);const note=clean(value(row,'note'));const lecturerNames=splitLecturers(value(row,'lecturer'));const lecturer=lecturerNames.join(', ');const shift=clean(value(row,'shift'));const workload=parseHustWorkload(value(row,'workloadExpression'));const credits=numberOrNull(value(row,'credits'))??workload.credits;
    const explicitWeek=clean(value(row,'weekExpression'));const weekInfo=parseWeekExpression(explicitWeek||(/tuần/i.test(note)?note:''));const explicitClock=parseClockRangeExpression(value(row,'timeExpression'));
    const common:CanonicalRecord={semester,targetClass:clean(value(row,'targetClass')),schoolFaculty:clean(value(row,'schoolFaculty')),expectedSemester:clean(value(row,'expectedSemester')),courseCode,courseName,courseNameEnglish,credits,sectionId,group,componentType,day,slot:null,startPeriod:null,endPeriod:null,startTime:'',endTime:'',room:clean(value(row,'room')),lecturer,lecturers:lecturerNames,capacity:numberOrNull(value(row,'capacity')),lectureHours:numberOrNull(value(row,'lectureHours')),practiceHours:numberOrNull(value(row,'practiceHours')),note,shift,weekExpression:weekInfo.expression,weeks:weekInfo.weeks,sourceRow:rowNumber,sourceData:rawSource};
    const messages:string[]=[];if(!semester)messages.push('Thiếu Kỳ học');if(day!==null&&(day<2||day>8))messages.push('Thứ phải từ 2 đến 8 (8 là Chủ nhật)');if(weekInfo.error)messages.push(`Tuần: ${weekInfo.error}`);if(workload.error)messages.push(`Khối lượng HUST: ${workload.error}`);
    const periodText=value(row,'periodExpression');const slotText=value(row,'slot');const rawStart=value(row,'startPeriod');const rawEnd=value(row,'endPeriod');let directStart=numberOrNull(rawStart);let directEnd=numberOrNull(rawEnd);let expanded:CanonicalRecord[]=[];
    if(!isMissingValue(periodText)){
      const parsed=parseNumberExpression(periodText,1,14);if(parsed.error)messages.push(`Tiết: ${parsed.error}`);else expanded=parsed.ranges.map(range=>({...common,startPeriod:range.start,endPeriod:range.end,startTime:explicitClock.startTime,endTime:explicitClock.endTime}));
    }else if(!isMissingValue(slotText)){
      const parsed=parseNumberExpression(slotText,1,4);if(parsed.error)messages.push(`Ca: ${parsed.error}`);else expanded=parsed.ranges.flatMap(range=>Array.from({length:range.end-range.start+1},(_,offset)=>range.start+offset).map(slot=>{const periods=slotToPeriods(slot);return {...common,slot,startPeriod:periods.start,endPeriod:periods.end,startTime:explicitClock.startTime,endTime:explicitClock.endTime}}));
    }else if(!isMissingValue(rawStart)||!isMissingValue(rawEnd)){
      const clockStart=parseClockMinutes(rawStart);const clockEnd=parseClockMinutes(rawEnd);const usesClock=clockStart!==null||clockEnd!==null;
      if(usesClock){const clockRange=clockRangeToPeriods(rawStart,rawEnd);if(clockRange.error)messages.push(`BĐ/KT theo giờ: ${clockRange.error}`);else expanded=[{...common,startPeriod:clockRange.startPeriod,endPeriod:clockRange.endPeriod,startTime:clockRange.startTime,endTime:clockRange.endTime}]}
      else {
        const offset=shiftOffset(shift);if(shift&&offset===null)messages.push('Kíp phải là Sáng, Chiều hoặc Tối');
        else if(directStart!==null&&directEnd!==null&&offset===6&&directEnd<=6){directStart+=6;directEnd+=6}
        else if(directStart!==null&&directEnd!==null&&offset===12&&directEnd<=2){directStart+=12;directEnd+=12}
        if(offset===0&&shift&&directEnd!==null&&directEnd>6)messages.push('Kíp Sáng chỉ tương ứng tiết 1–6');
        if(offset===6&&directStart!==null&&directEnd!==null&&(directStart<7||directEnd>12))messages.push('Kíp Chiều phải là KT 1–6 hoặc tiết 7–12');
        if(offset===12&&directStart!==null&&directEnd!==null&&(directStart<13||directEnd>14))messages.push('Kíp Tối phải là KT 1–2 hoặc tiết 13–14');
        if(directStart===null||directEnd===null||directStart<1||directEnd>14||directStart>directEnd)messages.push('BĐ/KT phải đủ và tương ứng tiết 1–14');else expanded=[{...common,startPeriod:directStart,endPeriod:directEnd,startTime:explicitClock.startTime,endTime:explicitClock.endTime}];
      }
    }else if(explicitClock.startPeriod!==null&&explicitClock.endPeriod!==null)expanded=[{...common,startPeriod:explicitClock.startPeriod,endPeriod:explicitClock.endPeriod,startTime:explicitClock.startTime,endTime:explicitClock.endTime}];
    else if(explicitClock.error)messages.push(`Thời gian: ${explicitClock.error}`);
    else expanded=[common];
    if(messages.length){issues.push({rowNumber,messages});records.push(common)}else records.push(...expanded);
  });return {records,issues,ignoredRows};
}

export function normalizeRows(rows:Record<string,unknown>[],fallbackSemester=''):CanonicalRecord[]{
  const headers=rows.length?Object.keys(rows[0]):[];const draft:ExcelDraft={fileName:'',sheetName:'',sheetNames:[''],headerRow:1,columns:headers.map((label,index)=>({index,excelColumn:excelColumn(index),label})),rows:rows.map(row=>headers.map(header=>row[header])),mapping:guessMapping(headers),detectedFormat:'Tự động/khác'};
  const result=normalizeDraft(draft,draft.mapping,fallbackSemester);if(result.issues.length)throw new Error(`Dòng ${result.issues[0].rowNumber}: ${result.issues[0].messages.join(', ')}.`);return result.records;
}

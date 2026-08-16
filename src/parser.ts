import * as XLSX from 'xlsx';
import type { CanonicalRecord } from './types';

export type CanonicalKey=Exclude<keyof CanonicalRecord,'sourceRow'|'sourceData'|'lecturers'|'weeks'>;
export type MappingKey=CanonicalKey|'periodExpression';
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
  {key:'credits',label:'Tín chỉ',aliases:['TC','Tín chỉ','Tin chi','Số TC','So TC']},
  {key:'sectionId',label:'Mã LHP/Mã lớp',aliases:['Mã LHP','Ma LHP','Mã_lớp','Mã lớp học phần','Ma lop hoc phan','Mã lớp HP','Ma lop HP','Mã lớp','Ma lop']},
  {key:'group',label:'Nhóm',aliases:['Nhóm','Nhom','Nhóm lớp','Nhom lop']},
  {key:'componentType',label:'Loại buổi',aliases:['LT/BT/TH','LT/TH/BT','Loại_lớp','Loại lớp','Loai lop','Loại buổi','Loai buoi','Loại hình','Loai hinh']},
  {key:'day',label:'Thứ',aliases:['Thứ','Thu','Ngày học','Ngay hoc']},
  {key:'periodExpression',label:'Tiết (chuỗi)',aliases:['Tiết','Tiet','Tiết học','Tiet hoc','Tiết BD-KT','Tiet BD-KT']},
  {key:'slot',label:'Ca (chuỗi)',aliases:['Ca','Ca học','Ca hoc']},
  {key:'startPeriod',label:'Tiết bắt đầu',aliases:['BĐ','BD','Bắt đầu','Bat dau','Từ tiết','Tu tiet']},
  {key:'endPeriod',label:'Tiết kết thúc',aliases:['KT','Kết thúc','Ket thuc','Đến tiết','Den tiet']},
  {key:'shift',label:'Kíp (Sáng/Chiều)',aliases:['Kíp','Kip','Buổi học','Buoi hoc']},
  {key:'weekExpression',label:'Tuần học',aliases:['Tuần','Tuan','Tuần học','Tuan hoc']},
  {key:'room',label:'Địa điểm học (GĐ/Phòng)',aliases:['GĐ','GD','Phòng','Phong','Giảng đường','Giang duong','Địa điểm','Dia diem']},
  {key:'lecturer',label:'Giảng viên',aliases:['Giảng viên','Giang vien','GV','Cán bộ','Can bo','GV (theo phân công)']},
  {key:'capacity',label:'Sĩ số lớp',aliases:['SS lớp','SS lop','Sĩ số','Si so','SL lớp học','SL lop hoc','Số lượng','So luong','SL_Max']},
  {key:'lectureHours',label:'Số giờ LT',aliases:['LT','Giờ LT','Gio LT']},
  {key:'practiceHours',label:'Số giờ BT/TH',aliases:['BT/TH','BT TH','TH','Giờ TH','Gio TH']},
  {key:'note',label:'Ghi chú',aliases:['Ghi chú học','Ghi chu hoc','Ghi_chú','Ghi chú','Ghi chu','Chú ý','Chu y']},
];

const clean=(value:unknown)=>String(value??'').trim();
const plain=(value:unknown)=>clean(value).toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const normalized=(value:unknown)=>plain(value).replace(/[^a-z0-9]/g,'');
const numberOrNull=(value:unknown)=>{const text=clean(value);if(!text)return null;const number=Number(text.replace(',','.'));return Number.isFinite(number)?number:null};
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

function shiftOffset(value:unknown){const text=normalized(value);if(!text||text==='sang'||text==='am'||text==='1')return 0;if(text==='chieu'||text==='pm'||text==='2')return 6;return null}
function guessMapping(headers:unknown[]):ColumnMapping{const mapping:ColumnMapping={};fieldDefinitions.forEach(field=>{const index=headers.findIndex(header=>field.aliases.some(alias=>normalized(alias)===normalized(header)));mapping[field.key]=index>=0?index:null});return mapping}
const headerScore=(row:unknown[])=>{const mapping=guessMapping(row);return fieldDefinitions.reduce((score,field)=>score+(mapping[field.key]!==null?1:0),0)};
const detectFormat=(headers:unknown[])=>{const keys=headers.map(normalized);const isUet=keys.includes('malhp')&&(keys.includes('ca')||keys.includes('gd'));const isHust=keys.includes('malop')&&keys.includes('bd')&&keys.includes('kt')&&keys.includes('kip');if(isUet)return 'UET/VNU';if(isHust)return 'HUST';return 'Tự động/khác'};

function findHeader(matrix:unknown[][]){const candidates=matrix.slice(0,50).map((row,index)=>({index,score:headerScore(row)})).sort((a,b)=>b.score-a.score);return candidates[0]?.score?candidates[0].index:0}
function previewMatrix(sheet:XLSX.WorkSheet){const range=XLSX.utils.decode_range(sheet['!ref']||'A1:A1');return XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',blankrows:false,range:{s:{r:0,c:0},e:{r:Math.min(range.e.r,49),c:Math.min(range.e.c,59)}}})}
function scoreSheet(sheet:XLSX.WorkSheet,name:string){const matrix=previewMatrix(sheet);const header=matrix[findHeader(matrix)]??[];const mapping=guessMapping(header);let score=headerScore(header)*10;if(typeof mapping.courseCode==='number')score+=50;if(typeof mapping.day==='number')score+=30;if(typeof mapping.slot==='number'||typeof mapping.periodExpression==='number'||typeof mapping.startPeriod==='number'&&typeof mapping.endPeriod==='number')score+=40;if(typeof mapping.sectionId==='number')score+=10;if(/tkb|thoi khoa bieu/i.test(plain(name)))score+=15;return score}

export async function readExcelWorkbook(file:File):Promise<ExcelWorkbookDraft>{
  const workbook=XLSX.read(await file.arrayBuffer());if(!workbook.SheetNames.length)throw new Error('Workbook không có sheet dữ liệu.');
  const suggestedSheet=[...workbook.SheetNames].sort((a,b)=>scoreSheet(workbook.Sheets[b],b)-scoreSheet(workbook.Sheets[a],a))[0];
  return {fileName:file.name,sheetNames:workbook.SheetNames,suggestedSheet,workbook};
}

export function createSheetDraft(source:ExcelWorkbookDraft,sheetName:string):ExcelDraft{
  const sheet=source.workbook.Sheets[sheetName];if(!sheet)throw new Error(`Không tìm thấy sheet “${sheetName}”.`);
  const matrix=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',blankrows:false});if(!matrix.length)throw new Error(`Sheet “${sheetName}” không có dữ liệu.`);
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
    if(!courseCode){ignoredRows.push({rowNumber,reason:'Không có Mã HP (dòng tiêu đề/tổng)'});return}
    const semester=clean(value(row,'semester'))||fallbackSemester;const courseName=clean(value(row,'courseName'))||courseCode;const group=clean(value(row,'group'));const sectionId=clean(value(row,'sectionId'))||[courseCode,group].filter(Boolean).join(' ')||courseCode;const componentType=clean(value(row,'componentType')).toUpperCase();const day=dayOrNull(value(row,'day'));const rawSource=sourceData(draft,row);const note=clean(value(row,'note'));const lecturerNames=splitLecturers(value(row,'lecturer'));const lecturer=lecturerNames.join(', ');const shift=clean(value(row,'shift'));
    const explicitWeek=clean(value(row,'weekExpression'));const weekInfo=parseWeekExpression(explicitWeek||(/tuần/i.test(note)?note:''));
    const common:CanonicalRecord={semester,targetClass:clean(value(row,'targetClass')),schoolFaculty:clean(value(row,'schoolFaculty')),expectedSemester:clean(value(row,'expectedSemester')),courseCode,courseName,credits:numberOrNull(value(row,'credits')),sectionId,group,componentType,day,slot:null,startPeriod:null,endPeriod:null,room:clean(value(row,'room')),lecturer,lecturers:lecturerNames,capacity:numberOrNull(value(row,'capacity')),lectureHours:numberOrNull(value(row,'lectureHours')),practiceHours:numberOrNull(value(row,'practiceHours')),note,shift,weekExpression:weekInfo.expression,weeks:weekInfo.weeks,sourceRow:rowNumber,sourceData:rawSource};
    const messages:string[]=[];if(!semester)messages.push('Thiếu Kỳ học');if(day!==null&&(day<2||day>7))messages.push('Thứ phải từ 2 đến 7');if(weekInfo.error)messages.push(`Tuần: ${weekInfo.error}`);
    const periodText=value(row,'periodExpression');const slotText=value(row,'slot');let directStart=numberOrNull(value(row,'startPeriod'));let directEnd=numberOrNull(value(row,'endPeriod'));let expanded:CanonicalRecord[]=[];
    if(clean(periodText)){
      const parsed=parseNumberExpression(periodText,1,12);if(parsed.error)messages.push(`Tiết: ${parsed.error}`);else expanded=parsed.ranges.map(range=>({...common,startPeriod:range.start,endPeriod:range.end}));
    }else if(clean(slotText)){
      const parsed=parseNumberExpression(slotText,1,4);if(parsed.error)messages.push(`Ca: ${parsed.error}`);else expanded=parsed.ranges.flatMap(range=>Array.from({length:range.end-range.start+1},(_,offset)=>range.start+offset).map(slot=>{const periods=slotToPeriods(slot);return {...common,slot,startPeriod:periods.start,endPeriod:periods.end}}));
    }else if(directStart!==null||directEnd!==null){
      const offset=shiftOffset(shift);if(shift&&offset===null)messages.push('Kíp phải là Sáng hoặc Chiều');else if(offset===6&&directStart!==null&&directEnd!==null&&directEnd<=6){directStart+=6;directEnd+=6}
      if(directStart===null||directEnd===null||directStart<1||directEnd>12||directStart>directEnd)messages.push('BĐ/KT phải đủ và tương ứng tiết 1–12');else expanded=[{...common,startPeriod:directStart,endPeriod:directEnd}];
    }else expanded=[common];
    if(messages.length){issues.push({rowNumber,messages});records.push(common)}else records.push(...expanded);
  });return {records,issues,ignoredRows};
}

export function normalizeRows(rows:Record<string,unknown>[],fallbackSemester=''):CanonicalRecord[]{
  const headers=rows.length?Object.keys(rows[0]):[];const draft:ExcelDraft={fileName:'',sheetName:'',sheetNames:[''],headerRow:1,columns:headers.map((label,index)=>({index,excelColumn:excelColumn(index),label})),rows:rows.map(row=>headers.map(header=>row[header])),mapping:guessMapping(headers),detectedFormat:'Tự động/khác'};
  const result=normalizeDraft(draft,draft.mapping,fallbackSemester);if(result.issues.length)throw new Error(`Dòng ${result.issues[0].rowNumber}: ${result.issues[0].messages.join(', ')}.`);return result.records;
}

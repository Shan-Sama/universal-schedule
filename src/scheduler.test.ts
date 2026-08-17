import {describe,expect,it} from 'vitest';
import * as XLSX from 'xlsx';
import {mockRecords} from './mock';
import {findSchedules,groupRecords,MAX_SCHEDULES,sectionsConflict} from './scheduler';
import {clockRangeToPeriods,createSheetDraft,fieldDefinitions,normalizeRows,parseClockMinutes,parseClockRangeExpression,parseHustWorkload,parseNumberExpression,parseWeekExpression,readExcelWorkbook,slotToPeriods,splitLecturers} from './parser';
import {normalizeSearchText} from './display';
import type {Course} from './types';

describe('Universal scheduler',()=>{
  it('đổi 4 ca thành 12 tiết',()=>{
    expect([1,2,3,4].map(slotToPeriods)).toEqual([{start:1,end:3},{start:4,end:6},{start:7,end:9},{start:10,end:12}]);
  });
  it('tách Khối_lượng HUST và lấy tín chỉ dùng chung với VNU',()=>{
    expect(parseHustWorkload('2 ( 2 - 1 - 0 - 4 )')).toMatchObject({credits:2,lecturePeriods:2,exercisePeriods:1,practicePeriods:0,selfStudyPeriods:4});
    const records=normalizeRows([{'Mã_HP':'EMA3135','Tên_HP':'Ví dụ HUST','Mã_lớp':'EMA3135 1','Khối_lượng':'2(2-1-0-4)'}],'20261');
    expect(records[0].credits).toBe(2);
  });
  it('ưu tiên TC riêng nếu file có cả TC và Khối_lượng',()=>{
    const records=normalizeRows([{'Mã_HP':'EMA3135','TC':'3','Khối_lượng':'2(2-1-0-4)'}],'20261');
    expect(records[0].credits).toBe(3);
  });
  it('đổi giờ thực tế sang toàn bộ tiết HUST có giao nhau',()=>{
    expect(clockRangeToPeriods('0700','0900')).toMatchObject({startPeriod:1,endPeriod:3,startTime:'07:00',endTime:'09:00'});
    expect(clockRangeToPeriods('0730','0930')).toMatchObject({startPeriod:2,endPeriod:4,startTime:'07:30',endTime:'09:30'});
    expect(clockRangeToPeriods('1800','2030')).toMatchObject({startPeriod:13,endPeriod:14,startTime:'18:00',endTime:'20:30'});
  });
  it('đọc giờ từ cột Thời_gian và lưu giờ cụ thể để hiển thị',()=>{
    expect(parseClockRangeExpression('0645-0910')).toMatchObject({startPeriod:1,endPeriod:3,startTime:'06:45',endTime:'09:10'});
    expect(parseClockMinutes(7/24)).toBe(420);
    const records=normalizeRows([{'Mã_HP':'AC2030','Mã_lớp':'158783','Thứ':'2','Thời_gian':'0645-0910','BĐ':'1','KT':'3','Kíp':'Sáng'}],'20261');
    expect(records[0]).toMatchObject({startPeriod:1,endPeriod:3,startTime:'06:45',endTime:'09:10'});
  });
  it('đổi Kíp Tối 1–2 thành tiết 13–14',()=>{
    const records=normalizeRows([{'Mã_HP':'FLJ1002','Mã_lớp':'1','Thứ':'4','BĐ':'1','KT':'2','Kíp':'Tối'}],'20261');
    expect(records[0]).toMatchObject({startPeriod:13,endPeriod:14,shift:'Tối'});
  });
  it('hiển thị nhãn tiết thống nhất cho cả UET và HUST',()=>{
    expect(fieldDefinitions.find(field=>field.key==='startPeriod')?.label).toBe('Tiết bắt đầu');
    expect(fieldDefinitions.find(field=>field.key==='endPeriod')?.label).toBe('Tiết kết thúc');
  });
  it('đọc chuỗi tiết có khoảng trắng',()=>{
    expect(parseNumberExpression('1 - 5, 7 - 9',1,12).ranges).toEqual([{start:1,end:5},{start:7,end:9}]);
  });
  it('tách giảng viên theo nhiều dấu nối',()=>{
    expect(splitLecturers('Nguyễn A + Trần B, Lê C & Phạm D; Vũ E')).toEqual(['Nguyễn A','Trần B','Lê C','Phạm D','Vũ E']);
  });
  it('tìm tiếng Việt không dấu không phân biệt chữ hoa thường',()=>{
    expect(normalizeSearchText('Kỹ thuật xử lý')).toBe('ky thuat xu ly');
  });
  it('chọn đúng sheet lịch và header không nằm ở dòng 1',async()=>{
    const workbook=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['Khóa','Lớp','HK dự kiến','Mã HP','Môn'],['K71','K71I',1,'UET.COM1050','Tư duy']]),'Tiến trình');
    XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['THỜI KHÓA BIỂU'],['Kỳ','Trường_Viện_Khoa','Mã_HP','Tên_HP','Mã_lớp','Thứ','BĐ','KT','Kíp','Tuần','Phòng'],['20261','Trường Điện - Điện tử','AC2010','Kỹ thuật lập trình','174410',2,1,3,'Chiều','2-9','D9-103']]),'TKB');
    const bytes=XLSX.write(workbook,{type:'array',bookType:'xlsx'});const source=await readExcelWorkbook(new File([bytes],'test.xlsx'));const draft=createSheetDraft(source,source.suggestedSheet);
    expect(source.suggestedSheet).toBe('TKB');expect(draft.headerRow).toBe(2);expect(draft.detectedFormat).toBe('HUST');expect(draft.columns.map(column=>column.label)).toContain('Phòng');expect(draft.mapping.schoolFaculty).toBe(1);
  });
  it('giữ Trường/Viện/Khoa trên section để hiển thị cùng Mã LHP',()=>{
    const records=normalizeRows([{'Mã_HP':'AC2010','Tên_HP':'Kỹ thuật lập trình','Mã_lớp':'174410','Lớp SV':'K67','Trường_Viện_Khoa':'Trường Điện - Điện tử'}],'20261');
    const section=groupRecords(records)[0].sections[0];expect(section).toMatchObject({id:'174410',targetClass:'K67',schoolFaculty:'Trường Điện - Điện tử'});
  });
  it('match và giữ tên học phần tiếng Anh của HUST',()=>{
    const records=normalizeRows([{'Mã_HP':'AC2010','Tên_HP':'Kỹ thuật lập trình','Tên_HP_Tiếng_Anh':'Programming Techniques','Mã_lớp':'174410'}],'20261');
    const course=groupRecords(records)[0];expect(course.nameEnglish).toBe('Programming Techniques');expect(course.sections[0].courseNameEnglish).toBe('Programming Techniques');
  });
  it('ưu tiên nhận diện UET khi sheet ghép có cả cột HUST',()=>{
    const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['Mã HP','Mã LHP','Thứ','Ca','GĐ','Mã_lớp','BĐ','KT','Kíp','Phòng']]),'Ghép');
    const draft=createSheetDraft({fileName:'test.xlsx',sheetNames:['Ghép'],suggestedSheet:'Ghép',workbook},'Ghép');expect(draft.detectedFormat).toBe('UET/VNU');
  });
  it('match UET và tách nhiều Ca',()=>{
    const records=normalizeRows([{'Mã HP':'ELT3297','Mã LHP':'ELT3297 1','Môn':'Lập trình điều khiển thiết bị','Ca':'1,2','Thứ':'6'}],'20261');
    expect(records).toHaveLength(2);expect(records.map(record=>[record.startPeriod,record.endPeriod])).toEqual([[1,3],[4,6]]);
  });
  it('match HUST và tách nhiều dải Tiết',()=>{
    const records=normalizeRows([{'Mã_HP':'MI1111','Tên_HP':'Giải tích 1','Mã_lớp':'123456','Thứ':'Thứ 3','Tiết':'1 - 5, 7 - 9'}],'20261');
    expect(records).toHaveLength(2);expect(records[0]).toMatchObject({sectionId:'123456',day:3,startPeriod:1,endPeriod:5});expect(records[1]).toMatchObject({startPeriod:7,endPeriod:9});
  });
  it('đổi KT của Kíp Chiều sang tiết 7-12',()=>{
    const records=normalizeRows([{'Mã_HP':'AC2010','Tên_HP':'Kỹ thuật lập trình','Mã_lớp':'174410','Thứ':'2','BĐ':'1','KT':'3','Kíp':'Chiều','Phòng':'D9-103','Tuần':'2-9,11-18'}],'20261');
    expect(records[0]).toMatchObject({startPeriod:7,endPeriod:9,room:'D9-103',shift:'Chiều'});expect(records[0].weeks).toContain(18);expect(records[0].weeks).not.toContain(10);
  });
  it('hiểu tuần chẵn và tuần lẻ là không giao nhau',()=>{
    const rows=[
      {'Mã HP':'A','Môn':'A','Mã LHP':'A1','Thứ':'3','Ca':'1','Ghi chú học':'Học tuần chẵn'},
      {'Mã HP':'B','Môn':'B','Mã LHP':'B1','Thứ':'3','Ca':'1','Ghi chú học':'Học tuần lẻ'},
    ];
    const courses=groupRecords(normalizeRows(rows,'20261'));
    expect(parseWeekExpression('tuần chẵn').weeks).not.toContain(3);expect(sectionsConflict(courses[0].sections[0],courses[1].sections[0])).toBe(false);
  });
  it('rút dải tuần trong câu ghi chú tự do mà không báo lỗi',()=>{
    const parsed=parseWeekExpression('2 ca liên tục/buổi, 5 tuần cuối 11-15');expect(parsed.error).toBeUndefined();expect(parsed.weeks).toEqual([11,12,13,14,15]);
  });
  it('bỏ qua dòng Tổng TC',()=>{
    const records=normalizeRows([{'Mã HP':'','Môn':'Tổng TC'},{'Mã HP':'ELT4007','Môn':'Dự án'}],'20261');expect(records).toHaveLength(1);expect(records[0].sectionId).toBe('ELT4007');
  });
  it('gom theo course và section',()=>{
    const courses=groupRecords(mockRecords);expect(courses.find(course=>course.code==='ELT3297')?.sections).toHaveLength(2);expect(courses.find(course=>course.code==='ELT3297')?.sections[0].meetings).toHaveLength(2);
  });
  it('tạo lựa chọn CL + N1 hoặc CL + N2 thay vì bắt học cả hai nhóm',()=>{
    const records=normalizeRows([
      {'Mã HP':'UET.COM1050','Mã LHP':'UET.COM1050 1','Môn':'Tư duy tính toán','Nhóm':'CL','LT/BT/TH':'LT','Thứ':'2','Ca':'1'},
      {'Mã HP':'UET.COM1050','Mã LHP':'UET.COM1050 1','Môn':'Tư duy tính toán','Nhóm':'1','LT/BT/TH':'TH','Thứ':'3','Ca':'2'},
      {'Mã HP':'UET.COM1050','Mã LHP':'UET.COM1050 1','Môn':'Tư duy tính toán','Nhóm':'2','LT/BT/TH':'TH','Thứ':'4','Ca':'2'},
    ],'20261');
    const sections=groupRecords(records)[0].sections;
    expect(sections).toHaveLength(2);
    expect(sections.map(section=>section.group)).toEqual(['N1','N2']);
    expect(sections.every(section=>section.meetings.length===2)).toBe(true);
    expect(sections[0].meetings.map(meeting=>meeting.group)).toEqual(['CL','N1']);
  });
  it('ONL không xung đột',()=>{
    const courses=groupRecords(mockRecords);expect(sectionsConflict(courses.find(course=>course.code==='ELT4007')!.sections[0],courses[0].sections[0])).toBe(false);
  });
  it('tìm được lịch',()=>{
    const courses=groupRecords(mockRecords);expect(findSchedules(courses,new Set(['ELT3297','INT3306']),{}).schedules.length).toBeGreaterThan(0);
  });
  it('chỉ MIX các section người dùng cho phép',()=>{
    const courses=groupRecords(mockRecords);const output=findSchedules(courses,new Set(['ELT3297']),{'ELT3297':['ELT3297 2']});
    expect(output.schedules).toHaveLength(1);expect(output.schedules[0].sections[0].id).toBe('ELT3297 2');
  });
  it('tạm bỏ môn khỏi scheduler khi bỏ chọn toàn bộ section',()=>{
    const courses=groupRecords(mockRecords);const output=findSchedules(courses,new Set(['ELT3297','INT3306']),{'ELT3297':[]});
    expect(output.diagnostics).toBeUndefined();expect(output.schedules).toHaveLength(2);
    expect(output.schedules.every(schedule=>schedule.sections.length===1&&schedule.sections[0].courseCode==='INT3306')).toBe(true);
  });
  it('giữ môn nhưng báo trạng thái tạm không xếp khi tất cả đều tắt',()=>{
    const courses=groupRecords(mockRecords);const output=findSchedules(courses,new Set(['ELT3297']),{'ELT3297':[]});
    expect(output.schedules).toHaveLength(0);expect(output.diagnostics?.reason).toContain('Chưa có học phần nào đang bật');
  });
  it('lọc nghỉ ngày, nghỉ ca và chỉ học sáng/chiều trước khi MIX',()=>{
    const courses=groupRecords(mockRecords);const selected=new Set(['ELT3297']);
    const offFriday=findSchedules(courses,selected,{}, {excludedDays:[6],excludedSlots:[],timeOfDay:'all'});
    expect(offFriday.schedules).toHaveLength(1);expect(offFriday.schedules[0].sections[0].id).toBe('ELT3297 2');
    expect(findSchedules(courses,selected,{}, {excludedDays:[],excludedSlots:[4],timeOfDay:'all'}).schedules).toHaveLength(0);
    expect(findSchedules(courses,selected,{}, {excludedDays:[],excludedSlots:[],timeOfDay:'morning'}).schedules).toHaveLength(0);
  });
  it('dừng đúng ở giới hạn 200 phương án',()=>{
    const courses:Course[]=Array.from({length:3},(_,courseIndex)=>({
      code:`C${courseIndex}`,name:`Môn ${courseIndex}`,nameEnglish:'',credits:3,semester:'20261',targetClass:'',schoolFaculty:'',expectedSemester:'',
      sections:Array.from({length:10},(_,sectionIndex)=>({id:`C${courseIndex}-${sectionIndex}`,courseCode:`C${courseIndex}`,courseName:`Môn ${courseIndex}`,courseNameEnglish:'',targetClass:'',schoolFaculty:'',group:'',capacity:null,meetings:[]})),
    }));
    const output=findSchedules(courses,new Set(courses.map(course=>course.code)),{},undefined,MAX_SCHEDULES);
    expect(output.schedules).toHaveLength(200);
    expect(new Set(output.schedules.map(schedule=>schedule.sections.map(section=>section.id).join('|'))).size).toBe(200);
  });
});

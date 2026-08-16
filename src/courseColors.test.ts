import {describe,expect,it} from 'vitest';
import {assignCourseColor,assignCourseColors,COURSE_PASTELS,releaseCourseColor} from './courseColors';

describe('cấp màu học phần',()=>{
  it('không lặp màu trong 20 môn được chọn',()=>{
    const codes=Array.from({length:COURSE_PASTELS.length},(_,index)=>`HP${index+1}`);
    const assignments=assignCourseColors({},codes,()=>0.47);
    expect(new Set(Object.values(assignments)).size).toBe(codes.length);
  });

  it('giữ nguyên màu khi môn đã có màu',()=>{
    const first=assignCourseColor({},'ELT3297',()=>0.2);
    const second=assignCourseColor(first,'ELT3297',()=>0.9);
    expect(second).toBe(first);
  });

  it('trả màu về kho sau khi xóa môn',()=>{
    const first=assignCourseColor({},'ELT3297',()=>0);
    const released=releaseCourseColor(first,'ELT3297');
    const reused=assignCourseColor(released,'INT3306',()=>0);
    expect(reused.INT3306).toBe(first.ELT3297);
  });
});

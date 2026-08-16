# TKB Universal V2.3.1 – UET/VNU + HUST

Ứng dụng React + TypeScript + Vite đọc Excel thời khóa biểu UET/VNU hoặc HUST, cho người dùng kiểm tra matching trước khi xác nhận dữ liệu, rồi tìm tối đa 200 tổ hợp lớp học phần không trùng lịch. Mọi xử lý diễn ra trong trình duyệt; file Excel không được gửi lên máy chủ.

## Các điểm mới trong V2.3.1

- Bộ **20 màu pastel** được cấp ngẫu nhiên từ các màu chưa dùng. Hai môn đang được chọn không bao giờ nhận cùng một màu.
- Môn **Tạm không xếp** vẫn giữ màu; chỉ khi xóa môn thì màu mới được trả về kho để cấp cho môn khác.
- Nếu chọn quá 20 môn, ứng dụng tự sinh thêm màu pastel không trùng thay vì lặp lại bảng màu.

- Mỗi môn đã lưu có nút **Chọn tất cả** và **Bỏ chọn tất cả** để thao tác nhanh toàn bộ section.
- Môn bỏ chọn hết section chuyển sang **Tạm không xếp**: vẫn được lưu trong danh sách nhưng không tham gia backtracking, và không làm chặn các môn còn lại.
- Màu của học phần được dùng đồng nhất trong danh sách môn, khu môn đã chọn và card trên TKB.

- Ba chế độ màu **Sáng / Tối / System**; lựa chọn được nhớ trên trình duyệt.
- Sửa dứt điểm lỗi số tiết 1–12 nhảy sang cột Thứ: mọi nhãn, ô và card đều có tọa độ lưới riêng.
- Danh sách môn gọn theo hàng, có tìm kiếm, phân trang và nút `‹ ›`.
- Chọn cố định 10 hoặc 20 dòng mỗi trang; trang cuối được bù khoảng trống nên cụm `‹ ›` không nhảy vị trí.
- Các môn đã tick xuất hiện trong khu **Môn đã chọn** để bỏ môn hoặc sửa section ngay tại chỗ.
- Một môn có nhiều lớp/section: mở **Chọn lớp**, tick tất cả section bạn có thể học; thuật toán tự MIX một section phù hợp cho mỗi môn.
- Tối đa **200 phương án khác nhau** bằng backtracking.
- Nút `‹ ›`, hộp chọn và phím mũi tên trái/phải để duyệt phương án.
- Lọc nâng cao: nghỉ bất kỳ ngày T2–T7, nghỉ bất kỳ Ca 1–4, chỉ học sáng hoặc chỉ học chiều.
- Sau khi đã xác nhận Excel vẫn có thể bấm **← Sửa matching** để quay lại bước 2. CSDL hiện tại chỉ đổi khi xác nhận lại.
- Nút **In / Lưu PDF** dùng chức năng Print của trình duyệt. PDF là text/vector, nhẹ hơn và có thể chọn, sao chép hoặc tìm kiếm chữ.
- Nếu file thiếu Kỳ học, ô nhập kỳ nằm ngay đầu phần kiểm tra; danh sách lỗi dài được giới hạn chiều cao và có thanh cuộn.
- Nhận và chuẩn hóa `Trường_Viện_Khoa` của HUST thành `schoolFaculty`; chấp nhận cả biến thể `Trường_Việt_Khoa`.
- Mỗi Mã LHP hiển thị kèm Lớp/Khóa và Trường/Viện/Khoa trong bộ chọn section, danh sách môn đã chọn và card lịch.
- Bảng preview cố định Dòng, Kỳ, Mã HP, Tên học phần, Mã LHP bên trái và cột Kiểm tra bên phải; các cột giữa cuộn ngang độc lập.
- Giữ toàn bộ chức năng đọc UET/VNU + HUST của V1.4: chọn sheet, nhận diện header, Ca, Tiết, KT/Kíp, tuần chẵn/lẻ và nhiều giảng viên.

## 1. Chuẩn bị máy

Cài ba phần mềm:

1. [Node.js LTS](https://nodejs.org/) – khuyến nghị Node 20 trở lên.
2. [Visual Studio Code](https://code.visualstudio.com/).
3. [Git](https://git-scm.com/downloads).

Mở PowerShell hoặc Terminal và kiểm tra:

```powershell
node --version
npm --version
git --version
```

Nếu cả ba lệnh đều hiện phiên bản, máy đã sẵn sàng.

## 2. Mở project bằng VS Code và chạy V2.3.1

1. Giải nén file ZIP.
2. Mở VS Code.
3. Chọn **File → Open Folder…**.
4. Chọn đúng thư mục `tkb-universal-v2.3.1`, tức thư mục đang chứa `package.json`.
5. Chọn **Terminal → New Terminal**.
6. Cài thư viện:

```powershell
npm install
```

7. Chạy ứng dụng:

```powershell
npm run dev
```

8. Terminal hiện địa chỉ tương tự `http://localhost:5173`. Giữ Terminal chạy và mở địa chỉ đó trong trình duyệt.
9. Khi muốn dừng, quay lại Terminal và nhấn `Ctrl+C`.

Các lệnh kiểm tra bản production:

```powershell
npm run test
npm run build
npm run preview
```

- `npm run test`: chạy bộ kiểm thử parser và scheduler.
- `npm run build`: kiểm tra TypeScript và tạo thư mục `dist`.
- `npm run preview`: xem thử chính bản production vừa build.

Project cũng có `pnpm-lock.yaml`. Nếu quen pnpm, có thể thay `npm` bằng `pnpm`.

## 3. Cách sử dụng – từ Excel tới lịch hoàn chỉnh

### Bước 1 – Chọn nguồn

- Bấm **Chọn file Excel** để nạp `.xlsx` hoặc `.xls`.
- Hoặc bấm **Dùng dữ liệu mock** để mô phỏng ngay.
- Việc chọn file chưa ghi đè CSDL đang dùng.

### Bước 2 – Chọn sheet và matching

1. Nếu workbook có nhiều sheet, chọn đúng sheet lịch trong hộp **Sheet đang đọc**.
2. Xem định dạng đang được nhận diện là `UET/VNU`, `HUST` hay `Chung`.
3. Kiểm tra bốn nhóm matching:
   - Nhận dạng học phần.
   - Thời gian học.
   - Địa điểm và con người.
   - Khối lượng và ghi chú.
4. Chỉ `Mã HP` là bắt buộc. Nếu thiếu tên môn hoặc Mã LHP, hệ thống có thể tạo giá trị dự phòng.
5. Bảng **Tất cả cột nguồn** phải liệt kê đủ cột A, B, C… trong sheet. Cột không dùng cho thuật toán vẫn được giữ trong `sourceData`.
6. Nếu file không có cột `Kỳ học`, nhập kỳ áp dụng chung, ví dụ `20261`.
7. Nếu thiếu Kỳ học, nhập ngay ở ô cảnh báo phía trên. Danh sách lỗi nêu rõ **số dòng Excel** và có thanh cuộn khi quá dài.
8. Bấm **Xác nhận và cập nhật CSDL**.

Sau này, từ bước chọn môn, bấm **← Sửa matching** để quay lại đây. Nếu đổi ý, dữ liệu cũ vẫn còn cho tới khi xác nhận lại.

### Bước 3 – Chọn môn và các lớp có thể học

1. Tick các học phần cần đăng ký.
2. Với môn có nhiều section, bấm **Chọn lớp**.
3. Tick tất cả section bạn có thể học. Ví dụ môn Triết học có 8 lớp nhưng bạn chỉ học được 4 lớp, hãy tick đúng 4 lớp đó.
4. Thuật toán sẽ chọn đúng **một section của mỗi môn** và MIX giữa các section đã cho phép.
5. Dùng ô tìm kiếm theo mã, tên hoặc giảng viên. Dùng `‹ ›` dưới danh sách để chuyển trang môn.

### Bước 4 – Lọc nâng cao

- **Nghỉ ngày:** có thể tick T4, T7 hoặc nhiều ngày cùng lúc.
- **Nghỉ ca:** Ca 1 = tiết 1–3, Ca 2 = 4–6, Ca 3 = 7–9, Ca 4 = 10–12.
- **Chỉ học sáng:** mọi buổi phải nằm trọn trong tiết 1–6.
- **Chỉ học chiều:** mọi buổi phải nằm trọn trong tiết 7–12.
- Bấm **Đặt lại** để bỏ toàn bộ bộ lọc.

Bộ lọc loại section không phù hợp trước khi backtracking. Nếu một môn không còn section nào, diagnostics sẽ nêu đúng mã môn và đề nghị chọn thêm section hoặc nới bộ lọc.

### Bước 5 – Tính và duyệt lịch

1. Bấm **Tính tối đa 200 lịch MIX**.
2. Dùng nút `‹ ›`, danh sách **Phương án N/M**, hoặc phím mũi tên trái/phải.
3. Mỗi card lịch hiện mã môn, Mã LHP, LT/BT/TH, Ca, tiết, phòng, tuần học và giảng viên.
4. ONL hoặc dòng thiếu Thứ/thời gian vẫn nằm trong section nhưng được liệt kê dưới bảng và không chiếm ô.
5. Bấm **In / Lưu PDF**. Trong hộp Print của trình duyệt, chọn máy in **Save as PDF / Microsoft Print to PDF** rồi lưu file. Nội dung là text thật, không phải ảnh pixel.

## 4. Dữ liệu thời gian được hiểu như thế nào?

### UET/VNU – Ca

```text
Ca 1 → tiết 1–3
Ca 2 → tiết 4–6
Ca 3 → tiết 7–9
Ca 4 → tiết 10–12
```

Một ô `Ca` có thể chứa nhiều giá trị:

```text
1,2     → hai Meeting: tiết 1–3 và 4–6
1 - 2   → Ca 1 và Ca 2
```

### HUST hoặc file dùng cột Tiết

```text
1-5             → một Meeting tiết 1 đến 5
1 - 5, 7 - 9    → hai Meeting; khoảng trắng quanh dấu - được chấp nhận
```

### HUST – BĐ / KT / Kíp

- Kíp Sáng: KT 1–6 tương ứng tiết 1–6.
- Kíp Chiều: tự cộng 6; BĐ 1, KT 3 thành tiết 7–9.
- Cả ngày vẫn dùng 12 KT = 12 tiết.

### Tuần học

```text
2-9,11-18       → tuần 2..9 và 11..18
Học tuần chẵn   → 2,4,6,…
Học tuần lẻ     → 1,3,5,…
```

Hai buổi cùng Thứ và tiết nhưng không giao tuần có thể xen kẽ và không bị coi là xung đột.

### Giảng viên

Các dấu `,`, `+`, `&`, `;`, `|` hoặc xuống dòng đều được dùng để tách nhiều giảng viên, trong khi chuỗi gốc vẫn được giữ để hiển thị.

## 5. Schema chuẩn nội bộ

Schema lõi gồm:

```text
semester, targetClass, schoolFaculty, expectedSemester, courseCode, courseName, credits,
sectionId, group, componentType, day, slot, startPeriod, endPeriod,
room, lecturer, capacity, lectureHours, practiceHours, note
```

V2.3.1 bổ sung metadata cần cho dữ liệu đa trường:

```text
shift, weekExpression, weeks, lecturers,
sourceRow, sourceData
```

`periodExpression` là trường matching đầu vào; sau khi chuẩn hóa nó được chuyển thành `startPeriod` và `endPeriod`.

Luồng dữ liệu:

```text
Excel → nhận diện sheet/header → người dùng kiểm tra matching
      → CanonicalRecord → Course → Section → Meeting
      → lọc section → backtracking → tối đa 200 Schedule
```

## 6. Mỗi file làm gì?

```text
tkb-universal-v2.3.1/
├─ .github/workflows/deploy.yml  Kiểm thử, build và deploy GitHub Pages
├─ src/
│  ├─ App.tsx                    Toàn bộ luồng UI V2.3.1
│  ├─ courseColors.ts           Cấp ngẫu nhiên màu pastel không trùng
│  ├─ courseColors.test.ts      3 kiểm thử riêng cho bộ cấp màu
│  ├─ parser.ts                 Đọc Excel, header, matching, chuẩn hóa
│  ├─ scheduler.ts              Gom dữ liệu, lọc và backtracking
│  ├─ mock.ts                   Dữ liệu mô phỏng ELT3297
│  ├─ types.ts                  Schema TypeScript
│  ├─ scheduler.test.ts         21 kiểm thử parser + scheduler
│  ├─ styles.css                Theme và bố cục responsive
│  └─ main.tsx                  Điểm khởi động React
├─ vite.config.ts               Cấu hình Vite/GitHub Pages
└─ package.json                 Thư viện và lệnh npm
```

Các hàm quan trọng:

- `readExcelWorkbook(file)`: đọc workbook và chấm điểm để gợi ý sheet lịch.
- `createSheetDraft(source, sheetName)`: tìm header, lấy đủ mọi cột và tự gợi ý mapping.
- `normalizeDraft(...)`: áp dụng matching, nhập kỳ dự phòng và trả về dữ liệu + lỗi theo dòng.
- `parseNumberExpression(...)`: hiểu `1 - 5, 7 - 9`.
- `slotToPeriods(slot)`: đổi Ca 1–4 thành khoảng tiết.
- `splitLecturers(value)`: tách nhiều giảng viên.
- `parseWeekExpression(value)`: đọc dải tuần, tuần chẵn/lẻ.
- `groupRecords(records)`: gom `Mã HP → Mã LHP → Meeting`.
- `sectionsConflict(a, b)`: kiểm tra chồng Thứ, tiết và tuần.
- `sectionMatchesFilters(...)`: loại section vi phạm ngày, ca hoặc sáng/chiều.
- `findSchedules(...)`: MIX các section được tick, không trùng, dừng ở 200 lịch.
- `Timetable`: dựng lưới có tọa độ cố định T2–T7 × tiết 1–12.
- `printSchedule()`: gọi Print của trình duyệt; `@media print` dựng bản A4 ngang bằng HTML/CSS để giữ text thật.

## 7. Tạo Git repo và đẩy lên GitHub

Trong Terminal của VS Code, bảo đảm đang đứng tại thư mục chứa `package.json`:

```powershell
git init
git add .
git commit -m "feat: TKB Universal V2.3.1"
git branch -M main
```

Vào [GitHub – New repository](https://github.com/new), tạo repo tên `tkb-vnu`. Không cần tick tạo README vì project đã có.

GitHub sẽ cung cấp URL repo. Với HTTPS:

```powershell
git remote add origin https://github.com/TEN-CUA-BAN/tkb-vnu.git
git push -u origin main
```

Hoặc SSH:

```powershell
git remote add origin git@github.com:TEN-CUA-BAN/tkb-vnu.git
git push -u origin main
```

Thay `TEN-CUA-BAN` bằng username GitHub. Kiểm tra bằng:

```powershell
git remote -v
```

Những lần cập nhật sau:

```powershell
git add .
git commit -m "mo ta thay doi"
git push
```

## 8. Bật GitHub Pages

Workflow deploy đã có sẵn:

1. Mở repo trên GitHub.
2. Vào **Settings → Pages**.
3. Ở **Build and deployment → Source**, chọn **GitHub Actions**.
4. Mở tab **Actions**, chờ workflow `Deploy GitHub Pages` có dấu xanh.
5. Link thường có dạng `https://TEN-CUA-BAN.github.io/tkb-vnu/`.

Workflow tự chạy `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build` rồi phát hành thư mục `dist`.

## 9. Giới hạn hiện tại

- Mỗi lần xác nhận một sheet; chưa ghép nhiều sheet trong cùng workbook.
- Dữ liệu nằm trong bộ nhớ trình duyệt; tải lại trang quay về mock.
- Bố cục Print tối ưu cho A4 ngang; hộp thoại và tên tùy chọn lưu PDF có thể khác nhau giữa Chrome, Edge và Firefox.
- Backtracking trả về 200 phương án đầu tiên; chưa chấm điểm để ưu tiên lịch ít ngày học hoặc ít khoảng trống.

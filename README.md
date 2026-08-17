# TKB Universal V2.5

Ứng dụng tạo thời khóa biểu cho dữ liệu **UET/VNU, HUST và các file Excel có cấu trúc tương tự**. Người dùng được kiểm tra lại việc matching cột trước khi nhập dữ liệu, chọn nhiều lớp có thể học, đặt điều kiện nghỉ và tạo tối đa 200 phương án không trùng lịch.

> Website: [https://shan-sama.github.io/universal-schedule/](https://shan-sama.github.io/universal-schedule/)

File Excel được xử lý ngay trong trình duyệt và không được gửi lên máy chủ.

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Sử dụng nhanh trên website](#sử-dụng-nhanh-trên-website)
- [Hướng dẫn chi tiết](#hướng-dẫn-chi-tiết)
- [Dữ liệu thời gian được hỗ trợ](#dữ-liệu-thời-gian-được-hỗ-trợ)
- [Chèn ảnh minh họa vào README](#chèn-ảnh-minh-họa-vào-readme)
- [Chạy project bằng VS Code](#chạy-project-bằng-vs-code)
- [Đưa project lên GitHub](#đưa-project-lên-github)
- [Triển khai GitHub Pages](#triển-khai-github-pages)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)
- [Cấu trúc project](#cấu-trúc-project)

## Tính năng chính

- Đọc file `.xlsx` và `.xls` bằng SheetJS.
- Tự nhận diện sheet, dòng header và định dạng UET/VNU hoặc HUST.
- Cho phép người dùng matching lại từng cột trước khi cập nhật dữ liệu.
- Giữ toàn bộ cột nguồn trong `sourceData`, kể cả cột không dùng để xếp lịch.
- Hỗ trợ Ca, Tiết, BĐ/KT, Kíp Sáng/Chiều/Tối, giờ học cụ thể, tuần chẵn/lẻ và nhiều giảng viên.
- Tách `Khối_lượng` HUST như `2(2-1-0-4)` để lấy `2` tín chỉ dùng chung với VNU.
- Gom dữ liệu theo `Mã HP → Mã LHP → Meeting`.
- Nhận diện `CL` là cả lớp và tách `N1/N2/N3` thành các lựa chọn BT/TH/TN thay thế nhau.
- Một môn có thể chọn nhiều section có thể học để hệ thống tự MIX.
- Bỏ chọn toàn bộ section sẽ chuyển môn sang **Tạm không xếp**, không xóa môn.
- Tạo tối đa 200 phương án bằng backtracking.
- Lọc nghỉ ngày, nghỉ ca, nghỉ Kíp Tối, chỉ học sáng, chiều hoặc tối.
- Mỗi môn nhận một màu pastel riêng, không trùng với môn đang chọn khác.
- Tìm kiếm không dấu theo mã, tên Việt, tên Anh, lớp và giảng viên.
- Hiển thị T2–Chủ nhật × tiết 1–14, kèm tên môn, nhóm, phòng, giảng viên, giờ học cụ thể, Lớp/Khóa và Trường/Viện/Khoa; chữ trong card có thể bôi đen để copy.
- Có thanh kéo điều chỉnh chiều cao từng tiết để xem gọn trong một màn hình hoặc mở rộng khi cần đọc chi tiết.
- In hoặc lưu PDF dạng text/vector bằng chức năng Print của trình duyệt.
- Có ba giao diện **Sáng / Tối / System**.
- Nút **Hướng dẫn** đọc nội dung ngắn gọn từ `public/HUONG_DAN.md`, hỗ trợ ảnh minh họa.

## Sử dụng nhanh trên website

1. Mở [TKB Universal](https://shan-sama.github.io/universal-schedule/).
2. Bấm **Chọn file Excel** hoặc **Dùng dữ liệu mock**.
3. Chọn đúng sheet và kiểm tra matching.
4. Nhập **Kỳ học** nếu file không có cột kỳ.
5. Bấm **Xác nhận và cập nhật CSDL**.
6. Tick môn cần học và các section có thể đăng ký.
7. Chọn bộ lọc nếu cần.
8. Bấm **Tính tối đa 200 lịch MIX**.
9. Duyệt các phương án và chọn **In / Lưu PDF**.

Ngay trong ứng dụng, bấm **? Hướng dẫn** ở góc trên để xem bản hướng dẫn ngắn. Nội dung này được lấy từ `public/HUONG_DAN.md`; ảnh đặt trong `public/guide-images/`.

## Hướng dẫn chi tiết

### Bước 1 – Chọn dữ liệu nguồn

- Bấm **Chọn file Excel** để nạp file `.xlsx` hoặc `.xls`.
- Nếu chỉ muốn thử ứng dụng, bấm **Dùng dữ liệu mock**.
- Chọn file mới chưa làm thay đổi CSDL hiện tại. Dữ liệu chỉ được cập nhật sau bước xác nhận matching.

Ảnh nên chụp cho bước này:

```text
docs/images/01-chon-du-lieu.png
```

Mẫu chèn ảnh ngay dưới đoạn hướng dẫn:

```markdown
![Bước 1 - Chọn file Excel](docs/images/01-chon-du-lieu.png)
```

### Bước 2 – Chọn sheet và matching cột

1. Chọn sheet lịch tại mục **Sheet đang đọc**.
2. Kiểm tra định dạng được nhận diện: `UET/VNU`, `HUST` hoặc `Chung`.
3. Kiểm tra các nhóm trường:
   - Nhận dạng học phần.
   - Thời gian học.
   - Địa điểm và con người.
   - Khối lượng và ghi chú.
4. Chỉ `Mã HP` là bắt buộc tuyệt đối.
5. Nếu file không có `Kỳ học`, nhập kỳ áp dụng chung, ví dụ `20261`.
6. Kiểm tra bảng **Tất cả cột nguồn**. Số cột phải tương ứng với file Excel.

Các trường thường dùng:

| Trường chuẩn | Header nguồn thường gặp |
|---|---|
| `semester` | Kỳ học, Học kỳ |
| `targetClass` | Lớp, Lớp/Khóa |
| `schoolFaculty` | Trường_Viện_Khoa, Trường_Việt_Khoa |
| `courseCode` | Mã HP, Mã học phần |
| `courseName` | Môn, Tên học phần |
| `credits` | TC, Tín chỉ |
| `workloadExpression` | Khối_lượng, Khối lượng HUST |
| `sectionId` | Mã LHP, Mã lớp |
| `componentType` | LT/BT/TH, Loại lớp |
| `day` | Thứ |
| `timeExpression` | Thời_gian, Thời gian cụ thể |
| `slot` | Ca |
| `startPeriod` | Tiết bắt đầu, BĐ |
| `endPeriod` | Tiết kết thúc, KT |
| `shift` | Kíp, Sáng/Chiều/Tối |
| `weekExpression` | Tuần học, Ghi chú học |
| `room` | GĐ, Phòng, Địa điểm học |
| `lecturer` | Giảng viên |

Ảnh nên chụp:

```text
docs/images/02-matching-cot.png
```

### Bước 3 – Kiểm tra dữ liệu sau matching

- Xem bảng **Xem trước sau matching** trước khi xác nhận.
- Các cột nhận dạng quan trọng được cố định bên trái.
- Cột **Kiểm tra** được cố định bên phải.
- Dùng thanh cuộn ngang để xem các cột thời gian, phòng và giảng viên ở giữa.
- Nếu có lỗi, ứng dụng hiển thị chính xác số dòng Excel cần kiểm tra.
- Dòng tiêu đề nhóm hoặc dòng tổng không có Mã HP được bỏ qua và không được nhập thành môn học.

Khi dữ liệu đúng, bấm **Xác nhận và cập nhật CSDL**.

Ảnh nên chụp:

```text
docs/images/03-xem-truoc-matching.png
```

### Bước 4 – Chọn môn và section có thể học

1. Tick môn cần đăng ký.
2. Bấm **Chọn lớp** để mở danh sách section.
3. Tick tất cả section bạn có thể học.
4. Hệ thống sẽ tự chọn một section phù hợp của mỗi môn khi MIX.

Quy ước nhóm:

- `CL`: cả lớp, thường là buổi lý thuyết chung.
- `N1`, `N2`, `N3`: các nhóm BT/TH/TN thay thế nhau. Hệ thống ghép buổi `CL` với đúng một nhóm đã chọn, không bắt học đồng thời N1 và N2.

Trong khu **Môn đã chọn**:

- **Chọn tất cả:** bật nhanh toàn bộ section của môn.
- **Bỏ chọn tất cả:** giữ môn nhưng chuyển sang **Tạm không xếp**.
- Nút `×`: xóa hoàn toàn môn khỏi danh sách đã chọn.

Môn tạm không xếp vẫn giữ màu và các section đã lưu. Khi bật lại section, môn tiếp tục tham gia xếp lịch.

Ảnh nên chụp:

```text
docs/images/04-chon-mon-va-lop.png
```

### Bước 5 – Lọc nâng cao và tạo lịch

Các bộ lọc gồm:

- **Nghỉ ngày:** chọn một hoặc nhiều ngày T2–Chủ nhật.
- **Nghỉ ca:** chọn một hoặc nhiều Ca 1–4.
- **Chỉ học sáng:** tất cả buổi học phải nằm trong tiết 1–6.
- **Chỉ học chiều:** tất cả buổi học phải nằm trong tiết 7–12.

Bấm **Tính tối đa 200 lịch MIX**. Nếu không có kết quả, phần thông báo sẽ cho biết môn nào hết section phù hợp hoặc nhóm lớp nào bị trùng lịch.

### Bước 6 – Duyệt và xuất thời khóa biểu

- Dùng nút `‹ ›`, hộp **Phương án N/M** hoặc phím mũi tên trái/phải.
- Các buổi cùng môn dùng cùng một màu pastel.
- Card lịch hiển thị Mã HP, tên môn tiếng Việt, Mã LHP, nhóm, loại buổi, Lớp/Khóa, Trường/Viện/Khoa, tiết, phòng, tuần học và giảng viên.
- Có thể kéo chuột bôi đen chữ trong card để copy như văn bản thông thường.
- ONL hoặc dòng thiếu Thứ/thời gian nằm dưới bảng và không chiếm ô.

Để lưu PDF:

1. Bấm **In / Lưu PDF**.
2. Trong hộp Print, chọn **Save as PDF** hoặc **Microsoft Print to PDF**.
3. Chọn khổ ngang nếu trình duyệt chưa tự đặt.
4. Bấm **Save**.

Ảnh nên chụp:

```text
docs/images/05-ket-qua-tkb.png
```

## Dữ liệu thời gian được hỗ trợ

### UET/VNU – Ca

| Ca | Tiết |
|---:|---:|
| 1 | 1–3 |
| 2 | 4–6 |
| 3 | 7–9 |
| 4 | 10–12 |

Một ô Ca có thể chứa nhiều giá trị:

```text
1,2       → tiết 1–3 và 4–6
1 - 2     → Ca 1 và Ca 2
```

### File dùng cột Tiết

```text
1-5             → tiết 1 đến 5
1 - 5, 7 - 9    → hai khoảng tiết
```

Khoảng trắng quanh dấu `-` được chấp nhận.

### HUST – BĐ, KT và Kíp

- Kíp Sáng: KT 1–6 tương ứng tiết 1–6.
- Kíp Chiều: hệ thống cộng 6; BĐ 1, KT 3 thành tiết 7–9.
- Kíp Tối: BĐ 1, KT 2 tương ứng tiết 13–14.
- Một ngày có tổng cộng 14 tiết.
- Giá trị `Thứ = 8` của HUST được hiển thị ở cột **Chủ nhật**.

`Khối_lượng` được phân rã theo dạng:

```text
2(2-1-0-4)
│ └──────── LT 2 · BT 1 · TH/TN 0 · Tự học 4
└────────── 2 tín chỉ
```

Nếu file có cả `TC` và `Khối_lượng`, cột `TC` được ưu tiên. Nếu chỉ có `Khối_lượng`, số đứng ngoài ngoặc trở thành `credits` dùng chung với VNU.

Các lớp dùng giờ thay cho số tiết cũng được hỗ trợ:

```text
0700–0900  → chiếm toàn bộ tiết 1–3
0730–0930  → chiếm toàn bộ tiết 2–4
1800–2030  → chiếm tiết 13–14 và vẫn hiển thị 18:00–20:30
```

Quy tắc là lấy mọi tiết có giao với khoảng giờ thực tế. App nhận cả cột `Thời_gian` dạng `0645-0910` và trường hợp BĐ/KT trực tiếp chứa `0700`, `0900`.

### Tuần học

```text
2-9,11-18       → tuần 2 đến 9 và 11 đến 18
Học tuần chẵn   → 2, 4, 6, ...
Học tuần lẻ     → 1, 3, 5, ...
```

Hai buổi cùng Thứ và tiết nhưng không giao tuần có thể xen kẽ và không bị coi là xung đột.

### Nhiều giảng viên

Các dấu sau đều có thể tách nhiều giảng viên:

```text
,  +  &  ;  |  hoặc xuống dòng
```

## Chèn ảnh minh họa vào README

### 1. Tạo thư mục ảnh

Trong project, tạo cấu trúc:

```text
docs/
└─ images/
   ├─ 01-chon-du-lieu.png
   ├─ 02-matching-cot.png
   ├─ 03-xem-truoc-matching.png
   ├─ 04-chon-mon-va-lop.png
   └─ 05-ket-qua-tkb.png
```

Tên file nên:

- Viết thường.
- Không dấu.
- Không chứa khoảng trắng.
- Có số thứ tự để ảnh hiển thị đúng trình tự.

### 2. Chụp và lưu ảnh

Trên Windows:

1. Mở đúng màn hình cần minh họa.
2. Nhấn `Windows + Shift + S`.
3. Kéo chọn khu vực quan trọng.
4. Lưu dưới dạng PNG vào `docs/images`.
5. Không chụp dữ liệu cá nhân, mã sinh viên, email hoặc thông tin nhạy cảm.

### 3. Chèn ảnh bằng Markdown

Đặt dòng sau tại vị trí muốn hiển thị:

```markdown
![Mô tả nội dung ảnh](docs/images/01-chon-du-lieu.png)
```

Ví dụ:

```markdown
### Bước 1 – Chọn dữ liệu nguồn

Bấm **Chọn file Excel** để nạp thời khóa biểu.

![Giao diện chọn file Excel](docs/images/01-chon-du-lieu.png)
```

### 4. Căn giữa và giới hạn chiều rộng

GitHub hỗ trợ HTML trong README:

```html
<p align="center">
  <img src="docs/images/01-chon-du-lieu.png"
       alt="Giao diện chọn file Excel"
       width="900" />
</p>
```

Nên dùng `width="800"` đến `width="1100"` cho ảnh chụp màn hình máy tính.

### 5. Những đường dẫn không nên dùng

Không dùng đường dẫn chỉ tồn tại trên máy cá nhân:

```markdown
![Sai](C:\Users\admin\Desktop\anh.png)
```

Không dùng dấu `\` của Windows trong đường dẫn README:

```markdown
![Sai](docs\images\anh.png)
```

Luôn dùng đường dẫn tương đối và dấu `/`:

```markdown
![Đúng](docs/images/anh.png)
```

GitHub phân biệt chữ hoa và chữ thường. `Anh.PNG` và `anh.png` có thể được xem là hai tên khác nhau.

### 6. Đẩy ảnh lên GitHub

Sau khi thêm ảnh:

```powershell
git add README.md docs/images
git commit -m "docs: thêm ảnh hướng dẫn sử dụng"
git push
```

Mở lại trang repository để kiểm tra ảnh. Nếu ảnh không hiện, kiểm tra tên file, phần mở rộng và chữ hoa/chữ thường.

## Chạy project bằng VS Code

### Yêu cầu

- [Node.js 24](https://nodejs.org/) hoặc bản mới hơn tương thích.
- [Visual Studio Code](https://code.visualstudio.com/).
- [Git](https://git-scm.com/downloads).

### Cài đặt

1. Giải nén project.
2. Mở VS Code.
3. Chọn **File → Open Folder…**.
4. Chọn thư mục chứa `package.json`.
5. Mở **Terminal → New Terminal**.

Chạy bằng npm:

```powershell
npm install
npm run dev
```

Mở địa chỉ Terminal hiển thị, thường là `http://localhost:5173`.

Các lệnh kiểm tra:

```powershell
npm run test
npm run build
npm run preview
```

Project có cả `package-lock.json` và `pnpm-lock.yaml`. Không nên chạy đồng thời npm và pnpm trong cùng một lần cài đặt.

## Đưa project lên GitHub

### Tạo Git repository

```powershell
git init
git add .
git commit -m "feat: TKB Universal V2.5"
git branch -M main
```

Tạo repository mới tại [github.com/new](https://github.com/new). Không cần chọn tạo README vì project đã có sẵn.

### Kết nối remote và push

```powershell
git remote add origin https://github.com/TEN-CUA-BAN/TEN-REPO.git
git push -u origin main
```

Các lần cập nhật sau:

```powershell
git add .
git commit -m "mô tả thay đổi"
git push
```

### Cập nhật V2.5 lên repository hiện có, giữ nguyên link

Không tạo repository mới và không chạy lại `git init`. Chép các file V2.5 vào đúng thư mục project cũ rồi chạy:

```powershell
git remote -v
git status
git add .
git commit -m "feat: update TKB Universal V2.5"
git push origin main
```

`git remote -v` phải vẫn hiện repository cũ, ví dụ `Shan-Sama/universal-schedule`. Khi push lên cùng nhánh `main`, GitHub Pages sẽ triển khai lại trên **đúng URL cũ**. Không dùng `git remote add origin` lần nữa nếu `origin` đã tồn tại.

## Triển khai GitHub Pages

Workflow nằm tại `.github/workflows/deploy.yml`.

1. Vào **Settings → Pages**.
2. Tại **Build and deployment → Source**, chọn **GitHub Actions**.
3. Vào tab **Actions** trên thanh menu repository.
4. Chờ workflow **Deploy GitHub Pages** có dấu xanh.
5. Mở đường dẫn trong **Settings → Pages → Visit site**.

Workflow dùng:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
    cache: pnpm
```

pnpm 11 yêu cầu Node.js từ 22.13 trở lên. Không đặt `node-version: 20`, vì workflow sẽ lỗi tại bước `actions/setup-node`.

Website thường có dạng:

```text
https://TEN-CUA-BAN.github.io/TEN-REPO/
```

## Xử lý lỗi thường gặp

### Workflow báo pnpm yêu cầu Node.js 22.13

Nguyên nhân: workflow đang dùng Node.js 20 với pnpm 11.

Sửa `.github/workflows/deploy.yml`:

```yaml
node-version: 24
```

Commit và push thay đổi. Không chỉ chạy lại workflow cũ vì workflow cũ vẫn dùng cấu hình của commit cũ.

### Không thấy đủ cột Excel

- Kiểm tra đã chọn đúng sheet chưa.
- Kiểm tra dòng header thực sự trong file.
- Xem mục **Tất cả cột nguồn** trước khi matching.

### Không xác nhận được CSDL

- Kiểm tra `Mã HP` đã được map.
- Nhập Kỳ học nếu file không có cột kỳ.
- Mở danh sách dòng lỗi và kiểm tra đúng số dòng Excel được báo.

### Không tìm được lịch

- Kiểm tra có môn nào đang **Tạm không xếp** không.
- Chọn thêm section cho các môn.
- Bỏ bớt điều kiện nghỉ ngày hoặc nghỉ ca.
- Kiểm tra tuần học và khoảng tiết đã matching đúng.

### GitHub Pages hiện 404

- Đợi 1–2 phút sau khi workflow xanh.
- Nhấn `Ctrl + F5`.
- Kiểm tra **Settings → Pages → Source = GitHub Actions**.
- Kiểm tra URL có đúng tên repository hay không.

## Cấu trúc project

```text
tkb-universal-v2.5/
├─ .github/workflows/deploy.yml  Build và triển khai GitHub Pages
├─ docs/images/                  Ảnh minh họa cho README
├─ public/
│  ├─ HUONG_DAN.md               Hướng dẫn ngắn hiển thị trong ứng dụng
│  └─ guide-images/              Ảnh của hướng dẫn trong ứng dụng
├─ src/
│  ├─ App.tsx                    Luồng giao diện chính
│  ├─ GuideModal.tsx             Đọc và hiển thị HUONG_DAN.md
│  ├─ display.ts                Tìm kiếm không dấu và định dạng thông tin buổi
│  ├─ parser.ts                 Đọc Excel và chuẩn hóa dữ liệu
│  ├─ scheduler.ts              Lọc section và backtracking
│  ├─ courseColors.ts           Cấp màu pastel không trùng
│  ├─ mock.ts                   Dữ liệu mô phỏng
│  ├─ types.ts                  Schema TypeScript
│  ├─ scheduler.test.ts         Kiểm thử parser và scheduler
│  ├─ courseColors.test.ts      Kiểm thử bộ cấp màu
│  ├─ styles.css                Giao diện và bản in
│  └─ main.tsx                  Điểm khởi động React
├─ README.md
├─ package.json
└─ vite.config.ts
```

## Schema chuẩn nội bộ

```text
semester, targetClass, schoolFaculty, expectedSemester,
courseCode, courseName, courseNameEnglish, credits, sectionId, group,
componentType, day, slot, startPeriod, endPeriod,
room, lecturer, capacity, lectureHours, practiceHours, note,
shift, weekExpression, weeks, lecturers, sourceRow, sourceData
```

## Kiểm thử

```powershell
npm run test
npm run build
```

Phiên bản V2.5 hiện có 32 kiểm thử tự động cho parser, scheduler, tìm kiếm, giờ HUST và bộ cấp màu.

## Bản quyền

© 2026 dtkyne · Vietnam National University, Hanoi.

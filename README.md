# CRM Playwright TypeScript Framework

Automation framework cho chức năng **Login** của Perfex CRM demo:
<https://crm.anhtester.com/admin/authentication>

Xây dựng theo mô hình **Page Object Model + Fixtures + Data-Driven Testing**.

---

## 1. Cấu trúc thư mục

```
.
├── playwright.config.ts        # Cấu hình chung: projects, reporter, timeout, trace/video
├── tsconfig.json               # Path alias @pages, @data, @config, @fixtures, @utils
├── .env / .env.example         # BASE_URL + tài khoản + tuỳ chọn chạy
├── src/
│   ├── config/env.ts           # Đọc .env, khai báo ROUTES và STORAGE_STATE
│   ├── pages/
│   │   ├── BasePage.ts         # Hành vi dùng chung: goto, click, type, wait, screenshot
│   │   ├── LoginPage.ts        # Locator + action + assertion của màn Login
│   │   └── DashboardPage.ts    # Màn sau khi đăng nhập thành công
│   ├── data/users.ts           # Tài khoản hợp lệ + bộ dữ liệu test âm + thông báo lỗi
│   ├── fixtures/test-fixtures.ts # Fixture inject sẵn loginPage / dashboardPage
│   └── utils/logger.ts         # Log từng bước ra console & report
└── tests/
    ├── auth.setup.ts           # Đăng nhập 1 lần, lưu session vào .auth/admin.json
    ├── login.spec.ts           # 14 test case cho chức năng Login
    └── dashboard.auth.spec.ts  # Test chạy bằng session đã lưu (không qua form login)
```

## 2. Cài đặt

```bash
npm install
```

```bash
npx playwright install --with-deps
```

Sao chép cấu hình môi trường (đã có sẵn file `.env`):

```bash
cp .env.example .env
```

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `BASE_URL` | `https://crm.anhtester.com` | URL hệ thống |
| `ADMIN_EMAIL` | `admin@example.com` | Tài khoản đăng nhập |
| `ADMIN_PASSWORD` | `123456` | Mật khẩu |
| `HEADLESS` | `true` | `false` để xem trình duyệt chạy |
| `SLOW_MO` | `0` | Làm chậm thao tác (ms) khi debug |
| `WORKERS` | `4` | Số luồng chạy song song |

> `.env` đã nằm trong `.gitignore` — không commit mật khẩu thật lên repo.

## 3. Chạy test

```bash
npm test
```

| Lệnh | Mục đích |
|---|---|
| `npm run test:login` | Chỉ chạy bộ test Login |
| `npm run test:smoke` | Chạy các case gắn tag `@smoke` |
| `npm run test:regression` | Chạy các case gắn tag `@regression` |
| `npm run test:headed` | Chạy có hiển thị trình duyệt |
| `npm run test:ui` | Mở Playwright UI Mode |
| `npm run test:debug` | Chạy ở chế độ debug từng bước |
| `npm run test:all-browsers` | Chạy trên Chromium + Firefox + WebKit |
| `npm run report` | Mở báo cáo HTML |
| `npm run codegen` | Ghi lại thao tác để sinh code |

## 4. Danh sách test case

| ID | Test case | Kỳ vọng |
|---|---|---|
| TC_LOGIN_01 | Hiển thị đầy đủ control màn Login | Có email, password (masked), Remember me, nút Login, link Forgot Password |
| TC_LOGIN_02 | Đăng nhập đúng tài khoản | Chuyển về `/admin/`, hiển thị sidebar |
| TC_LOGIN_03 | Đăng nhập có tick "Remember me" | Thành công, có cookie phiên |
| TC_LOGIN_04 | Email đúng + mật khẩu sai | `Invalid email or password` |
| TC_LOGIN_05 | Email chưa đăng ký | `Invalid email or password` |
| TC_LOGIN_06 | Bỏ trống email | `The Email Address field is required` |
| TC_LOGIN_07 | Bỏ trống mật khẩu | `The Password field is required` |
| TC_LOGIN_08 | Bỏ trống cả hai | Báo lỗi bắt buộc nhập |
| TC_LOGIN_09 | Mật khẩu thừa khoảng trắng | `Invalid email or password` |
| TC_LOGIN_10 | Payload SQL Injection | Bị từ chối, không đăng nhập được |
| TC_LOGIN_11 | Thông báo lỗi không lộ thông tin | Không nói rõ sai email hay sai mật khẩu |
| TC_LOGIN_12 | Mật khẩu sau khi lỗi | Ô mật khẩu rỗng và vẫn ở dạng `password` |
| TC_LOGIN_13 | Link "Forgot Password?" | Mở trang `forgot_password` |
| TC_LOGIN_14 | Vào `/admin/` khi chưa đăng nhập | Bị đẩy về trang Login |

Thêm 2 case ở `dashboard.auth.spec.ts`: dùng lại session đã lưu, và đăng xuất.

## 5. Ghi chú kỹ thuật

- **Locator**: ưu tiên `getByRole` cho nút/link; dùng `#email`, `#password`, `#remember` vì đây là id ổn định do Perfex render.
- **Xác thực lỗi**: Perfex validate ở phía server và render lỗi trong `div.alert-danger` bên trong form, nên trang sẽ **reload** khi đăng nhập thất bại — assertion bám theo `.alert-danger` thay vì tooltip HTML5.
- **Assertion trang Dashboard**: bản demo đang chạy giao diện tiếng Việt (tiêu đề "Bảng tin"), nên framework kiểm tra theo **URL + cấu trúc** (`#side-menu`) thay vì text đã dịch — tránh test gãy khi đổi ngôn ngữ.
- **Tái sử dụng phiên đăng nhập**: project `authenticated` phụ thuộc project `setup`, đọc `.auth/admin.json` để bỏ qua bước login.
- **Chẩn đoán lỗi**: `trace`, `screenshot`, `video` được giữ lại khi test fail (`reports/`, `test-results/`).

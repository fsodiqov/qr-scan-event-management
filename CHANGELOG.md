# Changelog

Barcha muhim o'zgarishlar ushbu faylda qayd etiladi.

Format [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ga asoslangan.
Versiyalash [Semantic Versioning](https://semver.org/) (SemVer) bo'yicha yuritiladi.

## [1.7.0] - 2026-07-18

### Added

- HttpOnly refresh token cookie + DB `RefreshSession` (rotation, revoke, logout-all)
- Access JWT faqat memory’da; axios interceptor silent `/auth/refresh`
- Account lockout (5 muvaffaqiyatsiz → 15 daqiqa) va login rate limit (`IP + login`)
- Active sessions UI (revoke / logout all devices)
- Password policy (12+, upper/lower/digit/special)
- `express-mongo-sanitize`, `$regex` escape, QR token Zod validation
- Production Helmet CSP; auth cookie Origin allowlist

### Changed

- JWT: access `15m`, refresh `7d` / remember-me `30d`; `JWT_SECRET` min 32 belgi
- CORS: production’da `*.vercel.app` wildcard olib tashlandi
- Seed / demo parollar yangi siyosatga moslashtirildi
- Login demo defaults: `owner` / `Owner123456!`

### Fixed

- Dashboard/Reports StatCard layout tweaks

## [1.6.0] - 2026-07-16

### Added

- Light/Dark theme (ThemeToggle, ThemeContext, design tokens)
- Organization logo va user profile photo upload (multer + sharp, WebP optimizatsiya)
- CSV export — attendance, reports va jadval sahifalari uchun
- Reports: period filter, trend/breakdown analytics va CSV yuklash
- Dashboard: check-in rate, active events, scans/invalid scans, quick actions
- Login: "Remember me" (`JWT_REMEMBER_EXPIRES_IN`, default 30d)
- ScanResultTag va scanner UX holatlari (ready/scanning/success/duplicate/invalid)
- Shared table pagination helper va status color theme

### Changed

- Admin/Auth layout, StatCard, PageHeader va global CSS redesign
- Dashboard recent activity va i18n (en/uz/ru/ko) yangilandi
- Account va Organization settings UI (logo/photo preview)

## [1.5.1] - 2026-07-15

### Changed

- Login page: default form `owner` / `owner123456` (ishlaydigan seed owner)

## [1.5.0] - 2026-07-15

### Added

- QR Scanner floating action button (pastki o‘ng) — `org:attendance_scan` ruxsati uchun
- `npm run seed:orgs` / `seed:orgs:reset` — bir nechta demo organization, team va eventlar
- Seed: Admin va Operator foydalanuvchilari (`admin` / `operator`)

### Changed

- Logout tugmasi headerdan sidebar pastiga ko‘chirildi (mobil drawerda ham)
- `delete.md` — multi-org seed credentiallari

## [1.4.0] - 2026-06-27

### Added

- `npm run seed:reset` — dev/demo uchun DB tozalash va qayta seed
- `backend/src/scripts/seedUserUtils.ts` — legacy email-login qidirish va upsert
- `migrate:login` skriptiga email-format loginlarni normalizatsiya qilish (2-bosqich)

### Changed

- Auth userlar uchun `email` maydoni `login` ga almashtirildi (min 1 belgi, email formati talab qilinmaydi)
- Login API: `POST /api/v1/auth/login` body `{ login, password }`
- Seed skriptlari mavjud userlarni yangilaydi (legacy `owner@example.com` → `owner`)
- Frontend: barcha auth/staff UI da "Email" o'rniga "Login"
- Seed credential: `superadmin` / `owner` (email emas)
- `ARCHITECTURE.md`, `.env.example`, `delete.md` yangilandi

### Fixed

- Eski DB da `email` qiymati `login` sifatida qolgani uchun kirish ishlamasligi

## [1.3.0] - 2026-06-25

### Added

- `useIsMobile` hook (`frontend/src/hooks/useBreakpoint.ts`) — umumiy mobil breakpoint (`lg` dan past)

### Changed

- Admin panel barcha sahifalar mobil responsive qilindi (8 sahifa, 9 URL)
- AdminLayout: mobilda Drawer navigatsiya, desktopda sidebar; header ixcham (icon logout)
- Jadval sahifalari (Users, Events, Attendance): gorizontal scroll, responsive ustunlar, kichik ekran pagination
- PageHeader, LanguageSwitcher, QRDisplay, formlar va modallar mobilga moslashtirildi
- `global.css`: mobil content padding (16px / 12px)
- AuthLayout va LoginPage: `clamp()` padding

## [1.2.0] - 2026-06-25

### Added

- Backend Docker image (`Dockerfile`, `.dockerignore`) — Cloud Run uchun
- Frontend Vercel deploy konfiguratsiyasi (`vercel.json`)
- QR skaner: HTTPS, ruxsat va kamera topilmasa xabarlari (4 til)
- CORS: `*.vercel.app` domenlariga avtomatik ruxsat
- Root `package-lock.json` (npm workspaces)

### Changed

- Backend `0.0.0.0` da tinglaydi (Docker/Cloud Run)
- QR skaner: orqa/old kamera tanlash, mobil viewport uchun `qrbox` o'lchami
- `.env.example` fayllar production (Atlas, Vercel, Cloud Run) izohlari bilan yangilandi
- `tsconfig.json`: seed skriptlari production builddan chiqarildi

### Fixed

- Mobilda kamera ishlamasligi (HTTPS, ruxsat, kamera tanlash)

## [1.1.0] - 2026-06-21

### Added

- Ko'p tillilik: o'zbek, rus, ingliz, koreys (`i18next`)
- Til almashtirgich (LanguageSwitcher)
- Mock ma'lumotlar seed skripti (`seed:mock`, `seed:mock:reset`) — 40 ta qatnashchi
- Backend xato va muvaffaqiyat kodlari (`errorCodes`, `successCodes`)
- Favicon va yangilangan global stillar

### Changed

- QR kodlar kichikroq qilindi (qisqaroq token, yengil error correction)
- Login va admin layout/UI yangilandi
- Barcha admin sahifalar i18n ga o'tkazildi
- API javoblari standartlashtirildi

## [1.0.0] - 2026-06-20

### Added

- Express + TypeScript backend (auth, users, events, attendance, QR)
- Check-in / check-out skanerlash logikasi
- React + Vite + Ant Design admin frontend
- Dashboard, foydalanuvchilar, tadbirlar, davomat, QR skaner sahifalari
- Docker Compose (MongoDB)
- Admin seed skripti
- Arxitektura hujjati (`ARCHITECTURE.md`)

[1.2.0]: https://github.com/fsodiqov/qr-scan-event-management/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/fsodiqov/qr-scan-event-management/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/fsodiqov/qr-scan-event-management/releases/tag/v1.0.0

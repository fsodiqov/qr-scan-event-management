# Changelog

Barcha muhim o'zgarishlar ushbu faylda qayd etiladi.

Format [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ga asoslangan.
Versiyalash [Semantic Versioning](https://semver.org/) (SemVer) bo'yicha yuritiladi.

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

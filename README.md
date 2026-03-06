# Music Cutter (A-B)

Aplikasi web untuk memotong audio dengan marker:
- `A` = titik awal
- `B` = titik akhir

Hasil potongan diunduh sebagai file `.wav`.

## Fitur Utama

- Dual slider A-B dalam satu track (bukan terpisah).
- Input manual waktu untuk `A` dan `B`.
- Format waktu konsisten dengan pemisah `:`:
  - `< 1 jam` -> `mm:ss:cc`
  - `>= 1 jam` -> `hh:mm:ss:cc`
- Putar pratinjau segmen A-B sebelum unduh.
- Ekspor hasil potong ke `.wav`.

## Menjalankan Aplikasi

### Opsi cepat (Windows)
Jalankan:

```bat
run.bat
```

Script akan:
1. Install dependency bila belum ada
2. Menjalankan `npm run dev`

### Opsi manual

```bash
npm install
npm start
```

Lalu buka URL lokal dari Vite (biasanya `http://localhost:5173`).

## Script NPM

- `npm start` - jalankan mode development (alias `vite`)
- `npm run dev` - jalankan mode development
- `npm run build` - build production
- `npm run preview` - preview hasil build

## Update ke GitHub

### Opsi cepat (Windows)

```bat
update-github.bat "pesan commit"
```

Script akan:
1. `git add .`
2. `git commit -m "pesan commit"`
3. `git push origin main`

Jika remote belum ada, tambahkan dulu:

```bash
git remote add origin https://github.com/USERNAME/REPO.git
```

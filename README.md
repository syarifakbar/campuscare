# KampusCare Web App

KampusCare adalah web app pengaduan fasilitas kampus berbasis **1 server, 2 client web, dan microservice-style backend**.

## Konsep Arsitektur

- **1 Server**: Node.js + Express sebagai API Gateway dan static web server.
- **Client 1**: Web Mahasiswa di `/`.
- **Client 2**: Web Admin/Petugas di `/admin`.
- **Microservice-style backend**:
  - Auth Service
  - Report Service
  - Category Service
  - Status Service
  - Notification Service
- **Database lokal**: `data/db.json`.

## Cara Menjalankan

```bash
npm install
npm start
```

Lalu buka:

- Client Mahasiswa: `http://localhost:3000`
- Client Admin: `http://localhost:3000/admin`

## Akun Demo

Mahasiswa:

- username: `mhs`
- password: `mhs123`

Admin:

- username: `admin`
- password: `admin123`

## Fitur Client Mahasiswa

- Login
- Register akun mahasiswa
- Membuat laporan fasilitas
- Melihat status laporan pribadi
- Melihat notifikasi perubahan status

## Fitur Client Admin

- Login admin
- Dashboard statistik laporan
- Melihat semua laporan mahasiswa
- Search/filter laporan berdasarkan keyword, status, dan kategori
- Update status laporan
- Memberikan catatan admin
- Menghapus laporan
- Mengelola kategori laporan
- Melihat database mahasiswa dan jumlah laporan setiap mahasiswa
- Export laporan ke JSON

## URL Penting

- `/` = client mahasiswa
- `/admin` = client admin
- `/api/auth` = API auth
- `/api/reports` = API laporan
- `/api/categories` = API kategori

## Catatan Deploy

Project ini bisa dideploy ke Render sebagai Node.js web service.

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

Untuk demo tugas, database JSON sudah cukup. Untuk deploy jangka panjang, database bisa dikembangkan ke MongoDB Atlas.

# Telegram Bot Creator

Aplikasi ini memungkinkan pengguna untuk membuat dan mengelola bot Telegram mereka sendiri melalui antarmuka web.

## Fitur

- Membuat bot Telegram baru
- Mengelola bot yang ada
- Menetapkan balasan otomatis berdasarkan kata kunci

## Prasyarat

- Node.js
- npm

## Instalasi

1.  **Kloning repositori:**
    ```bash
    git clone https://github.com/username/repo.git
    cd repo
    ```
2.  **Instal dependensi:**
    ```bash
    npm install
    ```
3.  **Buat file `.env`:**
    Buat file `.env` di direktori root dan tambahkan variabel lingkungan berikut:
    ```
    BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
    PORT=5001
    ```
4.  **Jalankan aplikasi:**
    ```bash
    npm start
    ```
    Ini akan memulai server web, bot utama, dan bot runner secara bersamaan.

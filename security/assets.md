# Asset & Data Inventory — LastKey

## 1. Deskripsi Singkat

LastKey adalah aplikasi digital vault yang dirancang untuk menyimpan data penting pengguna dan mendukung mekanisme Dead Man's Switch. Pada tahap awal, aplikasi menyediakan pengelolaan vault, data penerima, konfigurasi check-in, dan antarmuka untuk proses pelepasan data.

Inventaris ini mengidentifikasi aset yang perlu dilindungi berdasarkan tiga aspek keamanan:

- **Confidentiality (C):** perlindungan terhadap akses atau pengungkapan yang tidak sah.
- **Integrity (I):** perlindungan terhadap perubahan atau manipulasi yang tidak sah.
- **Availability (A):** kemampuan aset atau layanan untuk tetap tersedia ketika dibutuhkan.

Klasifikasi menggunakan tingkat **Rendah, Sedang, dan Tinggi**.

## 2. Asset & Data Inventory

| No. | Kategori | Aset / Data | C | I | A | Alasan |
|---|---|---|---|---|---|---|
| 1 | Data | File dalam Vault | Tinggi | Tinggi | Tinggi | File merupakan data utama yang disimpan pengguna dan harus terlindungi dari akses maupun perubahan yang tidak sah. |
| 2 | Data | Metadata Vault | Sedang | Tinggi | Sedang | Metadata digunakan untuk mengelola vault dan perubahan yang tidak sah dapat memengaruhi pengelolaan data. |
| 3 | Data | Data Recipient | Tinggi | Tinggi | Sedang | Informasi penerima berkaitan dengan pihak yang dapat menerima akses saat mekanisme release dijalankan. |
| 4 | Data | Data Check-in | Sedang | Tinggi | Tinggi | Data ini digunakan untuk menentukan status aktivitas pengguna dan memengaruhi proses Dead Man's Switch. |
| 5 | Layanan | Autentikasi | Tinggi | Tinggi | Tinggi | Layanan autentikasi mengontrol siapa yang dapat mengakses akun dan fitur LastKey. |
| 6 | Layanan | Vault Management | Tinggi | Tinggi | Tinggi | Layanan digunakan untuk membuat dan mengelola vault serta data yang dilindungi. |
| 7 | Layanan | Check-in & Release | Tinggi | Tinggi | Tinggi | Layanan menentukan status check-in dan dapat memengaruhi proses pelepasan data. |
| 8 | Secret | Encryption Key | Tinggi | Tinggi | Tinggi | Kunci digunakan untuk melindungi data terenkripsi. Kebocoran atau manipulasi kunci dapat membahayakan keamanan data. |
| 9 | Secret | Authentication / Session Secret | Tinggi | Tinggi | Tinggi | Secret yang berkaitan dengan autentikasi dapat memberikan akses ke akun atau sesi pengguna jika disalahgunakan. |
| 10 | Backup | Backup Data Vault | Tinggi | Tinggi | Tinggi | Backup dapat berisi salinan data penting sehingga tetap harus dilindungi dari akses dan perubahan tidak sah. |
| 11 | Log | Audit Log | Sedang | Tinggi | Sedang | Audit log digunakan untuk mencatat aktivitas sehingga integritas catatan penting untuk investigasi dan pemantauan keamanan. |
| 12 | Akun | Akun User | Tinggi | Tinggi | Tinggi | Akun merupakan identitas utama pengguna dan menjadi pintu akses ke vault serta fitur LastKey. |

## 3. Data yang Dilindungi dengan Mekanisme Kriptografi

Data berikut direncanakan mendapatkan perlindungan kriptografi:

| Data | Perlindungan |
|---|---|
| File dalam Vault | Enkripsi |
| Encryption Key | Perlindungan dan pengelolaan kunci |
| Data sensitif terkait release | Enkripsi atau perlindungan kriptografi sesuai desain |
| Data backup yang mengandung data sensitif | Enkripsi |

Mekanisme kriptografi akan ditentukan dan diimplementasikan pada tahap pengembangan berikutnya. Pada tahap ini, tabel menunjukkan data yang membutuhkan perlindungan kriptografi dan belum menyatakan bahwa mekanisme tersebut sudah diimplementasikan.

## 4. Catatan

Inventaris ini merupakan inventaris awal berdasarkan rancangan LastKey pada Milestone 1. Aset dan aliran data dapat diperbarui setelah arsitektur, DFD, dan threat modeling dikembangkan lebih lanjut.
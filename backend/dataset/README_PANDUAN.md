# Paket Dataset dan Notebook Demo Pakan Pintar Qurban

## Isi paket

1. `catatan_wawancara_peternak.csv` - fakta wawancara yang dicatat sebagaimana dilaporkan. Bukan data pengukuran terverifikasi.
2. `interpretasi_racikan_pakan_awal.csv` - konversi awal takaran ember ke kg/ekor/hari dengan asumsi 4 ember selama 3 hari. Perlu dikonfirmasi ke peternak.
3. `dataset_demo_sintetis_pbbh.csv` - 500 baris data buatan untuk menguji pipeline supervised learning. Kolom label `adg_kg_day_synthetic_label` dibuat oleh rumus simulasi, bukan hasil pengukuran sapi.
4. `Training_Model_Demo_Pakan_Pintar_Qurban.ipynb` - notebook Google Colab untuk training Random Forest Regressor, evaluasi, prediksi demonstrasi, dan ekspor model.

## Batasan penting

JANGAN menyatakan 500 baris sintetis sebagai data hasil wawancara atau data eksperimen peternakan. Jangan menggunakan model hasil training ini untuk merekomendasikan jumlah pakan sungguhan, memprediksi performa ternak secara klinis, atau mengklaim akurasi pada sapi Indonesia. Notebook hanya membuktikan alur teknis training dan integrasi model.

Model sintetis mempelajari rumus buatan yang sengaja ditanamkan ke data. Nilai MAE, RMSE, dan R2 hanya mengukur kemampuan meniru rumus itu.

## Konversi racikan awal dari catatan wawancara

Dengan asumsi 1 ember campuran diberikan 4 ember per 3 hari per ekor:

- Pollar: 0,18 kg/ember x 4/3 = sekitar 0,24 kg/hari
- NutriFeed: 1,40 kg/ember x 4/3 = sekitar 1,87 kg/hari
- Ampas tahu: titik tengah 1,875 kg/ember x 4/3 = sekitar 2,50 kg/hari
- Katul: 0,33 kg/ember x 4/3 = sekitar 0,44 kg/hari
- Total dari empat komponen = sekitar 5,05 kg/hari

Ini hampir sesuai dengan perkiraan 3,6-4 kg per ember x 4/3 = 4,8-5,33 kg/hari. Namun ada dua hal yang belum konsisten:

1. Katul juga disebut 1 kg/ekor/hari, sedangkan hasil konversi racikan hanya 0,44 kg/hari. Konfirmasi apakah 1 kg itu tambahan di luar racikan.
2. Komponen disebut 1 + 5 + 5-6 + 2 = 13-14 piring. Jika satu piring 0,5 liter, volumenya 6,5-7 liter, lebih besar daripada ember 5 liter. Konfirmasi apakah ukuran piring/ember dipakai dengan cara yang sama.

## Rekomendasi teknis untuk fitur target bobot

1. Hitung kebutuhan PBBH: `(target_bobot_kg - bobot_sekarang_kg) / hari_tersedia`.
2. Untuk memilih ransum, jangan memakai model sintetis ini. Dibutuhkan data komposisi nutrisi aktual bahan pakan (BK, PK, TDN/energi), harga aktual, konsumsi aktual, serta batas penggunaan tiap bahan.
3. Gunakan formulasi ransum/optimasi biaya dengan kendala nutrisi tervalidasi. ML baru layak digunakan untuk memperkirakan respons pertumbuhan bila tersedia banyak catatan longitudinal sapi dengan bobot dan pakan terukur.
4. Jika data lapangan belum cukup, tampilkan rekomendasi sebagai simulasi berbasis aturan/perhitungan yang divalidasi ahli, bukan hasil ML.

## Langkah di Google Colab

1. Buka https://colab.research.google.com/
2. Upload `Training_Model_Demo_Pakan_Pintar_Qurban.ipynb`.
3. Upload `dataset_demo_sintetis_pbbh.csv` ketika sel upload dijalankan.
4. Jalankan sel dari atas ke bawah.
5. Notebook akan melatih model demo, menampilkan MAE/RMSE/R2 sintetis, grafik, dan mengunduh `model_pbbh_demo_sintetis.joblib`.

## Catatan privasi dan kualitas data

Jangan memasukkan nama peternak atau nomor telepon ke dataset publik. Minta persetujuan peternak untuk menyimpan, mengolah, dan menggunakan data ternaknya. Simpan tanggal, satuan, metode pengukuran, dan sumber setiap nilai.

import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ChevronDownIcon } from '../components/icons'

const FAQS = [
  {
    q: 'Siapa yang bisa memakai GearHub?',
    a: 'Mahasiswa dengan email kampus (berakhiran .ac.id). Untuk menyewa atau menyewakan gear, akunmu harus sudah terverifikasi KTM.',
  },
  {
    q: 'Kenapa harus verifikasi KTM?',
    a: 'Supaya penyewa dan pemilik gear sama-sama mahasiswa yang identitasnya jelas, sehingga transaksi lebih aman dan saling percaya.',
  },
  {
    q: 'Bagaimana cara menyewa gear?',
    a: 'Cari gear di Beranda atau Pencarian, buka detailnya, lalu pilih Ajukan sewa. Tentukan tanggal, lakukan pembayaran, dan ambil gear di lokasi pemilik.',
  },
  {
    q: 'Apa itu deposit?',
    a: 'Uang jaminan yang dibayar bersama biaya sewa. Deposit dikembalikan setelah gear kembali dalam kondisi baik.',
  },
  {
    q: 'Bagaimana cara menyewakan gear sendiri?',
    a: 'Setelah akunmu terverifikasi, buka Tambah gear, isi data dan foto gear, lalu tentukan harga sewa per hari serta lokasi pengambilan.',
  },
  {
    q: 'Apakah verifikasi dan pembayaran di sini asli?',
    a: 'Tidak. GearHub adalah proyek portofolio. Verifikasi KTM dan pembayaran (QRIS, Virtual Account, Saldo GearHub) hanya simulasi, dan tidak ada uang sungguhan yang berpindah. Gunakan KTM contoh (dummy), bukan KTM aslimu.',
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4">
        <Link
          to="/profil"
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-2xl font-bold">Bantuan & FAQ</h1>
      </header>

      <div className="mt-2">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group border-b border-neutral-200 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDownIcon className="size-5 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-neutral-700">{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
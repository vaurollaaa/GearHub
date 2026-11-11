import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeftIcon, CheckIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { useApi } from '../lib/useApi'

const METHOD_LABEL = {
  wallet: 'Saldo GearHub',
  qris: 'QRIS',
  virtual_account: 'Virtual Account',
}

export default function PaymentPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const start = params.get('start')
  const end = params.get('end')
  const { token, user, updateUser } = useAuth()
  const {
    data: quote,
    error: quoteError,
    loading,
  } = useApi(start && end ? `/rentals/quote?gear_id=${id}&start_date=${start}&end_date=${end}` : null)
  const [method, setMethod] = useState('qris')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  if (!start || !end) return <Navigate to={`/gear/${id}/sewa`} replace />

  async function handlePay() {
    setError('')
    setSubmitting(true)
    try {
      const data = await apiRequest('/rentals', {
        method: 'POST',
        token,
        body: { gear_id: Number(id), start_date: start, end_date: end, payment_method: method },
      })
      updateUser((prev) => ({ ...prev, balance: data.balance }))
      setResult(data.rental)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-green-600 text-white">
          <CheckIcon className="size-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Pembayaran berhasil</h1>
        <p className="mt-2 text-neutral-700">
          Total {formatRupiah(result.total_amount)} dibayar dengan {METHOD_LABEL[result.payment_method]}.
          Ambil gear sesuai jadwal pickup, lalu lakukan cek kondisi.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Pembayaran ini simulasi. Tidak ada uang sungguhan yang berpindah.
        </p>
        <Link
          to="/aktivitas"
          className="mt-6 w-full rounded-2xl bg-brand-yellow py-3.5 text-lg font-semibold text-black"
        >
          Lihat aktivitas
        </Link>
        <Link to="/beranda" className="mt-3 text-sm text-neutral-600 underline">
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const walletTooLow = quote ? user.balance < quote.total_amount : false
  const methods = [
    {
      value: 'wallet',
      label: 'Saldo GearHub',
      sub: walletTooLow
        ? `${formatRupiah(user.balance)} (saldo tidak cukup)`
        : formatRupiah(user.balance),
      disabled: walletTooLow,
    },
    { value: 'qris', label: 'QRIS', sub: 'Gopay / OVO / Dana' },
    { value: 'virtual_account', label: 'Virtual Account', sub: 'BCA / Mandiri / BRI' },
  ]

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-8 pt-6">
      <header className="flex items-center gap-3 border-b border-neutral-200 pb-4">
        <Link
          to={`/gear/${id}/sewa`}
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-2xl font-bold">Pembayaran</h1>
      </header>

      <fieldset className="mt-5">
        <legend className="text-lg font-semibold">Metode</legend>
        <div className="mt-3 flex flex-col gap-3">
          {methods.map((m) => {
            const selected = method === m.value
            return (
              <label
                key={m.value}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  m.disabled
                    ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 opacity-50'
                    : selected
                      ? 'cursor-pointer border-brand-blue bg-brand-blue/10'
                      : 'cursor-pointer border-neutral-200 bg-neutral-100'
                }`}
              >
                <span>
                  <span className="block font-medium">{m.label}</span>
                  <span className="block text-xs text-neutral-500">{m.sub}</span>
                </span>
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={selected}
                  disabled={m.disabled}
                  onChange={() => setMethod(m.value)}
                  className="size-4 accent-brand-blue"
                />
              </label>
            )
          })}
        </div>
      </fieldset>

      <p className="mt-4 text-xs text-neutral-500">
        Pembayaran disimulasikan. Tidak ada uang sungguhan yang berpindah.
      </p>

      {loading && <p className="mt-4 text-neutral-600">Memuat...</p>}
      {quoteError && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {quoteError}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between border-t border-neutral-200 py-4 font-semibold">
          <span>Total</span>
          <span>{quote ? formatRupiah(quote.total_amount) : '-'}</span>
        </div>
        <button
          type="button"
          onClick={handlePay}
          disabled={!quote || submitting}
          className="w-full rounded-2xl bg-brand-yellow py-3.5 text-lg font-semibold text-black disabled:opacity-50"
        >
          {submitting ? 'Memproses...' : 'Bayar'}
        </button>
      </div>
    </div>
  )
}
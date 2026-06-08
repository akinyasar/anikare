import Link from 'next/link'

export const metadata = {
  title: 'Ödeme Tamamlandı — AnıKare',
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1a1a1a] mb-3">
          Ödeme Tamamlandı
        </h1>
        <p className="text-[#7a6a5a] leading-relaxed mb-2">
          Paketiniz birkaç saniye içinde aktive edilecek.
        </p>
        <p className="text-sm text-[#9ca3af] mb-8">
          Etkinlik sayfanızı yeniledikten sonra yeni paket limitleri geçerli olur.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#6D1A3E] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#5a1533] transition-colors"
        >
          Etkinliklerime Git →
        </Link>
      </div>
    </div>
  )
}

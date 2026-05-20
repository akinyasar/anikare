import Link from 'next/link'

const PLANS = [
  {
    name: 'Eko',
    price: 'Ücretsiz',
    sub: 'Sonsuza kadar',
    features: ['150 fotoğraf', '10 video', '1080p kalite', 'Standart QR kart', 'Türkçe / İngilizce'],
    cta: 'Ücretsiz Başla',
    highlight: false,
  },
  {
    name: 'Standart',
    price: '₺299',
    sub: 'Tek etkinlik',
    features: [
      'Sınırsız fotoğraf',
      '30 video',
      '4K kalite',
      'Özel masa kartı tasarımı',
      'Tüm diller',
    ],
    cta: 'Hemen Al',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '₺499',
    sub: 'Tek etkinlik',
    features: [
      'Sınırsız fotoğraf & video',
      'Orijinal kalite (sıkıştırma yok)',
      'Premium masa kartı',
      'Canlı slayt gösterisi',
      'Tüm özellikler',
    ],
    cta: 'Hemen Al',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <section className="py-20 bg-gray-50" id="fiyatlar">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Fiyatlandırma</h2>
          <p className="text-gray-400 mt-3">Etkinlik başına tek seferlik ödeme. Abonelik yok.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-7 flex flex-col ${
                plan.highlight
                  ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="mb-6">
                <p
                  className={`text-sm font-medium mb-2 ${
                    plan.highlight ? 'text-rose-100' : 'text-gray-400'
                  }`}
                >
                  {plan.name}
                </p>
                <p
                  className={`text-4xl font-bold ${
                    plan.highlight ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.price}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    plan.highlight ? 'text-rose-100' : 'text-gray-400'
                  }`}
                >
                  {plan.sub}
                </p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`text-sm flex items-center gap-2 ${
                      plan.highlight ? 'text-rose-50' : 'text-gray-600'
                    }`}
                  >
                    <span className={plan.highlight ? 'text-white' : 'text-rose-400'}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/giris"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-white text-rose-500 hover:bg-rose-50'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import type { PackageType } from '@/types'

const PACKAGES = [
  {
    value: 'eco' as PackageType,
    name: 'Eko',
    price: 'Ücretsiz',
    features: ['150 fotoğraf', '10 video', '1080p kalite', 'Standart QR kart'],
  },
  {
    value: 'standard' as PackageType,
    name: 'Standart',
    price: '₺299',
    popular: true,
    features: ['Sınırsız fotoğraf', '30 video', '4K kalite', 'Özel masa kartı'],
  },
  {
    value: 'premium' as PackageType,
    name: 'Premium',
    price: '₺499',
    features: [
      'Sınırsız fotoğraf & video',
      'Orijinal kalite',
      'Premium masa kartı',
      'Canlı slayt gösterisi',
    ],
  },
]

interface Props {
  state: { packageType: PackageType }
  update: (partial: { packageType: PackageType }) => void
}

export default function StepPackage({ state, update }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Etkinliğinize uygun paketi seçin. İstediğiniz zaman yükseltebilirsiniz.
      </p>
      {PACKAGES.map((pkg) => (
        <button
          key={pkg.value}
          type="button"
          onClick={() => update({ packageType: pkg.value })}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
            state.packageType === pkg.value
              ? 'border-rose-400 bg-rose-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{pkg.name}</span>
              {pkg.popular && (
                <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  Popüler
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900">{pkg.price}</span>
          </div>
          <ul className="space-y-1">
            {pkg.features.map((f) => (
              <li key={f} className="text-sm text-gray-500 flex items-center gap-1.5">
                <span className="text-rose-400">✓</span> {f}
              </li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  )
}

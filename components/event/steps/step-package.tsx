'use client'

import type { PackageType } from '@/types'

const PACKAGES = [
  {
    value: 'eco' as PackageType,
    name: 'Ücretsiz',
    price: 'Ücretsiz',
    features: ['10 fotoğraf', '2 video', 'Temel QR kart', 'Akışı keşfet'],
  },
  {
    value: 'standard' as PackageType,
    name: 'Standart',
    price: '₺1.000',
    popular: true,
    features: ['Sınırsız fotoğraf', '20 video', '4K kalite', '3 masa kartı şablonu (PDF)'],
  },
  {
    value: 'premium' as PackageType,
    name: 'Premium',
    price: '₺1.399',
    features: [
      'Sınırsız fotoğraf & video',
      'Orijinal kalite',
      '3 masa kartı şablonu (PDF)',
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
      <p className="text-sm text-[#7a6a5a] mb-4">
        Etkinliğinize uygun paketi seçin. Ücretsiz paket ile akışı görebilirsiniz.
      </p>
      {PACKAGES.map((pkg) => (
        <button
          key={pkg.value}
          type="button"
          onClick={() => update({ packageType: pkg.value })}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
            state.packageType === pkg.value
              ? 'border-[#6D1A3E] bg-[#f5e6ed]'
              : 'border-[#e8ddd5] hover:border-[#6D1A3E]/30 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1a1a1a]">{pkg.name}</span>
              {pkg.popular && (
                <span className="text-[10px] bg-[#6D1A3E] text-white px-2 py-0.5 rounded-full font-semibold">
                  En Popüler
                </span>
              )}
            </div>
            <span className="font-bold text-[#6D1A3E]">{pkg.price}</span>
          </div>
          <ul className="space-y-1">
            {pkg.features.map((f) => (
              <li key={f} className="text-sm text-[#7a6a5a] flex items-center gap-1.5">
                <span className="text-[#6D1A3E]">✓</span> {f}
              </li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  )
}

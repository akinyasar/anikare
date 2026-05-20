'use client'

const TEMPLATES = [
  { id: 'classic', name: 'Klasik', description: 'Beyaz zemin, sade tipografi' },
  { id: 'floral', name: 'Çiçekli', description: 'Çiçek motifli, romantik' },
  { id: 'minimal', name: 'Minimal', description: 'Siyah-beyaz, modern' },
  { id: 'golden', name: 'Gold', description: 'Altın vurgular, zarif' },
  { id: 'rustic', name: 'Rustik', description: 'Kraft kağıt hissi' },
  { id: 'modern', name: 'Modern', description: 'Geometrik, çarpıcı' },
]

interface Props {
  state: { templateId: string }
  update: (partial: { templateId: string }) => void
}

export default function StepTemplate({ state, update }: Props) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Masa kartı ve QR kod için şablon seçin. Satın alma sonrası PDF olarak indirebilirsiniz.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => update({ templateId: tpl.id })}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              state.templateId === tpl.id
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div
              className={`w-14 h-20 rounded-lg flex items-center justify-center text-xs font-medium ${
                tpl.id === 'classic' ? 'bg-gray-50 border border-gray-200' :
                tpl.id === 'floral' ? 'bg-pink-50 border border-pink-200' :
                tpl.id === 'minimal' ? 'bg-gray-900 text-white' :
                tpl.id === 'golden' ? 'bg-amber-50 border border-amber-300' :
                tpl.id === 'rustic' ? 'bg-orange-50 border border-orange-200' :
                'bg-violet-50 border border-violet-200'
              }`}
            >
              QR
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{tpl.name}</p>
              <p className="text-xs text-gray-400">{tpl.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const FEATURES = [
  {
    emoji: '📱',
    title: 'Uygulama indirme yok',
    description: 'Misafirler QR kodu okutup tarayıcıdan anında yükleme yapar.',
  },
  {
    emoji: '🌍',
    title: 'Otomatik dil tespiti',
    description: 'Arayüz Türkçe, İngilizce ve Almanca olarak otomatik açılır.',
  },
  {
    emoji: '🔒',
    title: 'PIN koruması',
    description: 'İsteğe bağlı 4 haneli PIN ile yüklemeleri yalnızca davetlilere açın.',
  },
  {
    emoji: '🖥️',
    title: 'Canlı slayt gösterisi',
    description: 'Salon ekranına yansıtın, yeni fotoğraflar otomatik akar. (Premium)',
  },
  {
    emoji: '⚡',
    title: 'Akıllı sıkıştırma',
    description: 'Paketinize göre fotoğraflar yüklenmeden önce optimize edilir.',
  },
  {
    emoji: '🗑️',
    title: 'Moderasyon',
    description: 'Dashboard\'dan uygunsuz içerikleri tek tıkla gizleyin veya silin.',
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Her şey düşünülmüş</h2>
          <p className="text-gray-400 mt-3">Ev sahibi için de, misafir için de.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-2xl p-6 hover:bg-rose-50 transition-colors group"
            >
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="font-semibold text-gray-900 mt-3 mb-1 group-hover:text-rose-600 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block bg-rose-100 text-rose-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🎉 Düğününüzdeki her anı yakalayın
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
            Misafirlerinizin{' '}
            <span className="text-rose-500">fotoğrafları</span>
            <br />
            tek bir yerde
          </h1>

          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            QR kodu okutan misafirleriniz, uygulama indirmeden anında fotoğraf yükler.
            Siz tüm anıları gerçek zamanlı olarak görürsünüz.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link
              href="/giris"
              className="bg-rose-500 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-rose-600 active:scale-[0.98] transition-all shadow-lg shadow-rose-200"
            >
              Ücretsiz Etkinlik Oluştur
            </Link>
            <Link
              href="#nasil-calisir"
              className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl text-base font-medium hover:bg-gray-50 transition-colors"
            >
              Nasıl çalışır? →
            </Link>
          </div>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto w-64 bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
            <div className="bg-white rounded-[2rem] overflow-hidden aspect-[9/19]">
              <div className="bg-rose-50 h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full mb-4" />
                <p className="font-bold text-gray-900">Ahmet & Ayşe</p>
                <p className="text-xs text-gray-400 mt-1">15 Haziran 2025</p>
                <div className="mt-6 space-y-2 w-full">
                  <div className="bg-rose-500 text-white text-sm py-3 rounded-xl font-medium">
                    📷 Kamera Aç
                  </div>
                  <div className="bg-gray-100 text-gray-700 text-sm py-3 rounded-xl font-medium">
                    🖼 Galeriden Seç
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

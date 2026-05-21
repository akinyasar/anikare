'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { MediaItem } from '@/types'

interface Props {
  item: MediaItem
  onClose: () => void
  onToggleVisibility: (item: MediaItem) => void
  onDelete: (item: MediaItem) => void
}

export default function MediaModal({ item, onClose, onToggleVisibility, onDelete }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gray-900 aspect-square">
            {item.file_type === 'video' ? (
              <video
                src={item.viewUrl ?? item.file_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.viewUrl ?? item.file_url}
                alt={item.guest_name}
                className="w-full h-full object-contain"
              />
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">{item.guest_name}</p>
                {item.guest_note && (
                  <p className="text-sm text-gray-500 mt-0.5">{item.guest_note}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.uploaded_at).toLocaleString('tr-TR')}
                </p>
              </div>
              <a
                href={item.viewUrl ?? item.file_url}
                download
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
              >
                ↓ İndir
              </a>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => onToggleVisibility(item)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  item.is_visible
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {item.is_visible ? '🙈 Gizle' : '👁 Göster'}
              </button>
              <button
                onClick={() => onDelete(item)}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                🗑 Sil
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

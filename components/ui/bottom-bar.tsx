interface BottomBarProps {
  children: React.ReactNode
  className?: string
  blur?: boolean
}

export default function BottomBar({ children, className = '', blur = true }: BottomBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] border-t border-[#e8ddd5] ${
        blur ? 'bg-white/90 backdrop-blur-xl' : 'bg-white'
      } ${className}`}
    >
      {children}
    </div>
  )
}

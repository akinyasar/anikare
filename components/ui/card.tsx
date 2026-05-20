interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div className={`bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] ${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}

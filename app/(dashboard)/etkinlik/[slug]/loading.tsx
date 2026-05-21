export default function Loading() {
  return (
    <div>
      {/* Event header */}
      <div className="mb-6">
        <div className="h-3 w-16 bg-[#F0EBE3] rounded-full animate-pulse mb-2" />
        <div className="h-7 w-56 bg-[#F0EBE3] rounded-full animate-pulse mb-2" />
        <div className="h-4 w-36 bg-[#F0EBE3] rounded-full animate-pulse" />
      </div>

      {/* Stats + QR */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#F0EBE3] rounded-2xl p-4 h-20 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="bg-[#F0EBE3] rounded-3xl w-full sm:w-52 h-52 animate-pulse" />
      </div>

      {/* Section title */}
      <div className="h-5 w-40 bg-[#F0EBE3] rounded-full animate-pulse mb-5" />

      {/* Filter chips */}
      <div className="flex gap-2 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-[#F0EBE3] rounded-full animate-pulse" />
        ))}
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#F0EBE3] rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-44 bg-[#F0EBE3] rounded-full animate-pulse" />
        <div className="h-10 w-36 bg-[#F0EBE3] rounded-full animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-[#e8ddd5] animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 w-2/3 bg-[#F0EBE3] rounded-full" />
              <div className="h-4 w-12 bg-[#F0EBE3] rounded-full" />
            </div>
            <div className="h-3.5 w-1/2 bg-[#F0EBE3] rounded-full mb-5" />
            <div className="flex justify-between">
              <div className="h-3.5 w-20 bg-[#F0EBE3] rounded-full" />
              <div className="h-3.5 w-14 bg-[#F0EBE3] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

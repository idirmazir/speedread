export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0b1120' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading</div>
      </div>
    </div>
  )
}

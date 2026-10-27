import Image from 'next/image'
import Link from 'next/link'

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl text-white/90 mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-white/50 [&_strong]:text-white/80 [&_strong]:font-medium [&_a]:text-accent-light [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-accent/30 hover:[&_a]:decoration-accent">
        {children}
      </div>
    </section>
  )
}

export default function LegalShell({
  title,
  effective,
  children,
}: {
  title: string
  effective: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen checkered-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-3 bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <Link href="/" aria-label="Pure Vision Tints — back to booking">
          <Image src="/pvLogo.jpg" alt="Pure Vision Tints" width={480} height={480} priority className="h-10 w-10 md:h-11 md:w-11 rounded-lg object-cover" />
        </Link>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">
          ← Back to booking
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-28 pb-20">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-accent-light/80 border border-accent/20 bg-accent/[0.06] rounded-full px-4 py-1.5 mb-6">
            <span>🏁</span> Pure Vision Tints
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">{title}</h1>
          <p className="text-sm text-white/35">Effective {effective}</p>
        </div>

        <div className="animate-fade-up animate-fade-up-delay-1">{children}</div>

        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/30">
          <Link href="/" className="hover:text-white/60 transition-colors">Book an appointment</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          <Link href="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </main>
  )
}

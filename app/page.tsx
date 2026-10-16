'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import WorkCarousel from './WorkCarousel'

const API = 'https://purevision-backend-production.up.railway.app'
const PHONE_DISPLAY = '(832) 512-3301'
const PHONE_TEL = '+18325123301'
// Number that replies to texts (Blooio line) — used for the tap-to-text link
const TEXT_DISPLAY = '(832) 741-0931'
const TEXT_TEL = '+18327410931'
const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/place/PureVision+Tint/@30.0112867,-95.8206073,17z/data=!3m1!4b1!4m6!3m5!1s0x8640bf5c19b5ade3:0xe489391c99bff018!8m2!3d30.0112867!4d-95.8206073!16s%2Fg%2F11x2x2lqzf'
const GOOGLE_REVIEW_COUNT = 125

const WORK_PHOTOS = [
  { src: '/work/cybertruck.jpg', caption: 'Tesla Cybertruck' },
  { src: '/work/civic.jpg', caption: 'Honda Civic' },
  { src: '/work/f150-raptor.jpg', caption: 'Ford F-150 Raptor' },
  { src: '/work/model3.jpg', caption: 'Tesla Model 3' },
  { src: '/work/bronco.jpg', caption: 'Ford Bronco' },
  { src: '/work/range-rover-sport.jpg', caption: 'Range Rover Sport' },
  { src: '/work/camaro.jpg', caption: 'Chevy Camaro' },
  { src: '/work/tacoma.jpg', caption: 'Toyota Tacoma' },
  { src: '/work/sierra-hd.jpg', caption: 'GMC Sierra HD' },
  { src: '/work/model-y.jpg', caption: 'Tesla Model Y' },
]

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Step = 'vehicle' | 'info' | 'service' | 'date' | 'confirm' | 'done'

interface Brand {
  id: string
  name: string
  logo?: string   // text-only bubble when omitted
  models: string[]
}

// Order = popularity; the first BRANDS_SHOWN appear before "More"
const BRANDS_SHOWN = 12
const BRANDS: Brand[] = [
  { id: 'ford', name: 'Ford', logo: '/brands/ford.svg', models: ['F-150', 'F-250', 'F-350', 'Bronco', 'Mustang', 'Explorer', 'Expedition', 'Escape', 'Ranger', 'Maverick', 'Edge'] },
  { id: 'tesla', name: 'Tesla', logo: '/brands/tesla.svg', models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'] },
  { id: 'honda', name: 'Honda', logo: '/brands/honda.svg', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Odyssey', 'Ridgeline'] },
  { id: 'hyundai', name: 'Hyundai', logo: '/brands/hyundai.svg', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Ioniq 5'] },
  { id: 'chevrolet', name: 'Chevrolet', logo: '/brands/chevrolet.svg', models: ['Silverado 1500', 'Silverado 2500', 'Tahoe', 'Suburban', 'Equinox', 'Colorado', 'Camaro', 'Corvette', 'Malibu', 'Traverse'] },
  { id: 'volkswagen', name: 'Volkswagen', logo: '/brands/volkswagen.svg', models: ['Jetta', 'Atlas', 'Tiguan', 'Golf', 'Taos', 'ID.4'] },
  { id: 'ram', name: 'Ram', logo: '/brands/ram.svg', models: ['1500', '2500', '3500', 'TRX'] },
  { id: 'toyota', name: 'Toyota', logo: '/brands/toyota.svg', models: ['Camry', 'Corolla', 'RAV4', 'Tacoma', 'Tundra', 'Highlander', '4Runner', 'Sequoia'] },
  { id: 'nissan', name: 'Nissan', logo: '/brands/nissan.svg', models: ['Altima', 'Rogue', 'Frontier', 'Titan', 'Sentra', 'Pathfinder'] },
  { id: 'gmc', name: 'GMC', models: ['Sierra 1500', 'Sierra 2500', 'Yukon', 'Acadia', 'Canyon', 'Terrain'] },
  { id: 'jeep', name: 'Jeep', logo: '/brands/jeep.svg', models: ['Wrangler', 'Grand Cherokee', 'Gladiator', 'Cherokee', 'Compass'] },
  { id: 'dodge', name: 'Dodge', models: ['Charger', 'Challenger', 'Durango'] },
  { id: 'kia', name: 'Kia', logo: '/brands/kia.svg', models: ['Telluride', 'Sorento', 'Sportage', 'K5', 'Soul', 'Carnival'] },
  { id: 'bmw', name: 'BMW', logo: '/brands/bmw.svg', models: ['3 Series', '5 Series', 'X3', 'X5', 'X1', 'M3'] },
  { id: 'mercedes', name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class', 'G-Class'] },
  { id: 'subaru', name: 'Subaru', logo: '/brands/subaru.svg', models: ['Outback', 'Forester', 'Crosstrek', 'WRX', 'Ascent'] },
  { id: 'audi', name: 'Audi', logo: '/brands/audi.svg', models: ['A4', 'A6', 'Q5', 'Q7', 'Q3'] },
  { id: 'cadillac', name: 'Cadillac', logo: '/brands/cadillac.svg', models: ['Escalade', 'CT5', 'XT5', 'XT6'] },
  { id: 'lexus', name: 'Lexus', models: ['RX', 'IS', 'ES', 'GX', 'NX'] },
  { id: 'mazda', name: 'Mazda', logo: '/brands/mazda.svg', models: ['CX-5', 'Mazda3', 'CX-30', 'CX-50', 'MX-5 Miata'] },
]

interface DateOption {
  date: string      // YYYY-MM-DD
  dayName: string   // Mon, Tue...
  dayNum: string    // 1, 2...
  month: string     // Aug, Sep...
  dow: number       // 0=Sun..6=Sat
  isToday: boolean
}

interface Special {
  id: string
  name: string
  price: string
  original: string
  desc: string
  details: string
  tag?: string
  daysAvailable?: number[]   // 0=Sun..6=Sat; omitted = every day
  availabilityNote?: string  // date-step subtitle override
  hidden?: boolean           // not shown as a card; still bookable via a link (e.g. while a single-offer ad runs)
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : undefined
}

// Meta's click id: the _fbc cookie, or built from ?fbclid= when the pixel hasn't set it yet
function getFbc(): string | undefined {
  const fromCookie = getCookie('_fbc')
  if (fromCookie) return fromCookie
  const fbclid = new URLSearchParams(window.location.search).get('fbclid')
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined
}

function getNext14Days(): DateOption[] {
  const days: DateOption[] = []
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA')

  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getTime() + i * 86400000)

    days.push({
      date: d.toLocaleDateString('en-CA'),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.toLocaleDateString('en-US', { day: 'numeric' }),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      dow: d.getDay(),
      isToday: d.toLocaleDateString('en-CA') === todayStr,
    })
  }
  return days
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState<Step>('vehicle')
  const [service, setService] = useState('')
  const [selectedDate, setSelectedDate] = useState<DateOption | null>(null)
  const timesRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const leadTracked = useRef(false)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [vBrand, setVBrand] = useState<Brand | null>(null)
  const [vModel, setVModel] = useState('')
  const [pickedBubble, setPickedBubble] = useState('')
  const [showMoreBrands, setShowMoreBrands] = useState(false)
  const [otherMode, setOtherMode] = useState<'' | 'brand' | 'model' | 'year'>('')
  const [otherText, setOtherText] = useState('')
  const [shade, setShade] = useState('20%')
  const [existingTint, setExistingTint] = useState('no')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [depositUrl, setDepositUrl] = useState('')

  const dates = getNext14Days()

  const services: Special[] = [
    {
      id: 'ceramic',
      name: 'Ceramic Special',
      price: '$299',
      original: '$600',
      desc: 'All side windows + rear',
      details: 'HITEK Ceramic Black · Blocks 78% IR heat & 99% UV · Lifetime warranty',
      tag: 'Fall Special',
    },
    {
      id: 'tesla-tuesday',
      name: 'Tesla Tuesday',
      price: '$600',
      original: '$749',
      desc: 'All side windows + full rear + full panoramic roof (windshield not included)',
      details: 'HITEK Ceramic Black · Blocks 78% IR heat & 99% UV · Lifetime warranty',
      tag: 'Tuesdays Only',
      daysAvailable: [2],
      availabilityNote: 'Tuesdays only · 9AM–5PM',
      hidden: true,
    },
  ]

  // Fetch availability when date is selected
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot('')
    setError('')

    fetch(`${API}/tools/get-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate.date }),
    })
      .then(r => r.json())
      .then(data => {
        setSlots(data.available_slots || [])
        setLoadingSlots(false)
      })
      .catch(() => {
        setSlots([])
        setLoadingSlots(false)
        setError('Unable to load availability. Please try again.')
      })
  }, [selectedDate])

  // On each step change, tuck the hero away so the step content starts near the top (mobile)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    if (progressRef.current) progressRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // Bring the time slots into view as soon as a day is picked
  useEffect(() => {
    if (!selectedDate) return
    const t = setTimeout(() => timesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    return () => clearTimeout(t)
  }, [selectedDate])

  // ── Vehicle bubbles ────────────────────────────────────────────────
  function pickBrand(b: Brand) {
    setPickedBubble(b.id)
    setTimeout(() => { setVBrand(b); setPickedBubble('') }, 380)
  }

  function pickModel(m: string) {
    setPickedBubble(m)
    setTimeout(() => { setVModel(m); setPickedBubble('') }, 320)
  }

  function pickYear(y: string) {
    setPickedBubble(y)
    setTimeout(() => {
      setVehicle(`${y} ${vBrand?.name ?? ''} ${vModel}`.trim())
      setPickedBubble('')
      setStep('info')
    }, 360)
  }

  function submitOther() {
    const text = otherText.trim()
    if (!text) return
    if (otherMode === 'brand') {
      setVehicle(text)
      setStep('info')
    } else if (otherMode === 'model') {
      setVModel(text)
    } else if (otherMode === 'year') {
      setVehicle(`${text} ${vBrand?.name ?? ''} ${vModel}`.trim())
      setStep('info')
    }
    setOtherMode('')
    setOtherText('')
  }

  function resetVehicle() {
    setVBrand(null)
    setVModel('')
    setVehicle('')
    setOtherMode('')
    setOtherText('')
    setPickedBubble('')
  }

  // ── Contact info → save the lead right away (no text is sent) ──────
  function submitInfo() {
    const digits = phone.replace(/\D/g, '')
    if (!name.trim() || digits.length < 10) {
      setError('Please enter your name and a 10-digit phone number')
      return
    }
    setError('')

    const chosen = service
      ? services.find(s => s.id === service)
      : visibleServices.length === 1 ? visibleServices[0] : undefined
    if (chosen && !service) setService(chosen.id)

    const cleanPhone = phone.replace(/[\s()-]/g, '')
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`
    fetch(`${API}/webhook/sms-only/pure-vision-tints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: name,
        phone: formattedPhone,
        'Vehicle Information': vehicle,
        lead_special_override: chosen?.name,
        source: 'booking_page',
      }),
    }).catch(() => { /* retried at the final step */ })

    // Meta "Lead": name + phone captured. The real "Purchase" is sent server-side only once the $20 is paid.
    if (!leadTracked.current) {
      leadTracked.current = true
      ;(window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.('track', 'Lead', { content_name: chosen?.name })
    }

    setStep(chosen ? 'date' : 'service')
  }

  // Book appointment + send deposit
  async function handleSubmit() {
    if (!name || !phone || !vehicle) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError('')

    const cleanPhone = phone.replace(/[\s()-]/g, '')
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`

    try {
      // 1. Make sure the lead exists (it was normally saved already when they entered their
      // phone — the backend de-dupes by phone). The appointment is NOT booked yet; it's only
      // booked once the $20 deposit is actually paid (see /webhooks/square on the backend).
      await fetch(`${API}/webhook/sms-only/pure-vision-tints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: name,
          phone: formattedPhone,
          'Vehicle Information': vehicle,
          lead_special_override: selectedService?.name,
          source: 'booking_page',
        }),
      })

      // 2. Create the $20 deposit link — no SMS is sent (Blooio blocks links/
      // attachments to contacts who haven't replied yet). The link is shown
      // directly on the confirmation screen instead. The appointment slot is
      // held on the lead but only booked on the calendar once payment completes.
      const slotHourMap: Record<string, string> = {
        '9AM': '09:00', '11AM': '11:00', '1PM': '13:00', '3PM': '15:00', '5PM': '17:00',
      }
      const timeStr = `${selectedDate!.date} ${slotHourMap[selectedSlot] || '09:00'}`

      const depositResp = await fetch(`${API}/tools/create-deposit-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_name: name,
          lead_phone: formattedPhone,
          lead_vehicle: vehicle,
          lead_special: selectedService?.name,
          appointment_time: timeStr,
          // Lets the backend attribute the paid deposit to the ad click (Meta Conversions API)
          fbp: getCookie('_fbp'),
          fbc: getFbc(),
          source_url: window.location.href,
        }),
      })
      const depositData = await depositResp.json()

      if (!depositData.success || !depositData.deposit_url) {
        setError('Something went wrong creating your deposit link. Please try again or text us directly.')
        return
      }

      setDepositUrl(depositData.deposit_url)
      setStep('done')
    } catch (e) {
      setError('Something went wrong. Please try again or text us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedService = services.find(s => s.id === service)
  const visibleServices = services.filter(s => !s.hidden)
  const hiddenServices = services.filter(s => s.hidden)
  const availableDates = selectedService?.daysAvailable
    ? dates.filter(d => selectedService.daysAvailable!.includes(d.dow))
    : dates

  const activeOffer = selectedService ?? visibleServices[0]
  const vStage: 'brand' | 'model' | 'year' = !vBrand ? 'brand' : !vModel ? 'model' : 'year'
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 16 }, (_, i) => String(thisYear + 1 - i))
  const brandList = showMoreBrands ? BRANDS : BRANDS.slice(0, BRANDS_SHOWN)
  const stepOrder: Record<Step, number> = { vehicle: 0, info: 1, service: 1, date: 2, confirm: 3, done: 3 }
  const stepIndex = stepOrder[step]
  const stepLabels = ['Vehicle', 'Details', 'Time', 'Confirm']

  return (
    <main className="min-h-screen checkered-bg">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="ambient-glow">
        <div className="ambient-glow-orb w-[46vw] h-[46vw] max-w-[560px] max-h-[560px] -top-[12%] -left-[10%] bg-[radial-gradient(circle,rgba(201,163,95,0.9)_0%,transparent_70%)] opacity-[0.16] animate-blob" />
        <div className="ambient-glow-orb w-[46vw] h-[46vw] max-w-[560px] max-h-[560px] -bottom-[14%] -right-[8%] bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,transparent_70%)] opacity-[0.06] animate-blob-delay" />
      </div>

      {/* HERO PHOTO BACKDROP */}
      <div className="absolute top-0 left-0 right-0 h-[380px] sm:h-[460px] md:h-[560px] overflow-hidden pointer-events-none">
        <Image
          src="/jordyTinting.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-[0.16] blur-[2px] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a]/85 to-[#0a0a0a]" />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-3 bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <Image
          src="/pvLogo.jpg"
          alt="Pure Vision Tints"
          width={480}
          height={480}
          priority
          className="h-10 w-10 md:h-11 md:w-11 rounded-lg object-cover"
        />
        <div className="flex items-center gap-4">
          <a href={`tel:${PHONE_TEL}`} className="text-sm text-white/40 hover:text-white transition-colors duration-200 hidden md:block">
            {PHONE_DISPLAY}
          </a>
          <div className="flex items-center gap-2 text-xs text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Open Daily · 9AM–5PM
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-28 pb-20 relative z-10">

        {/* ─── HERO ───────────────────────────────────────────── */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-accent-light/80 border border-accent/20 bg-accent/[0.06] rounded-full px-4 py-1.5 mb-6">
            <span>🏁</span> Hockley, TX · Est. 2020
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4">
            Book Your<br />
            <span className="bg-gradient-to-r from-white/70 via-white/40 to-white/20 bg-clip-text text-transparent italic">Tint Appointment</span>
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
            Premium window tinting by Jordy Chen. Machine-cut precision, HITEK ceramic film, lifetime warranty. Pick your time — done in 60 seconds.
          </p>

          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-accent/30 hover:bg-white/[0.06] transition-all duration-300 ease-smooth"
          >
            <span className="text-accent text-sm tracking-tighter">★★★★★</span>
            <span className="text-white/15">·</span>
            <span className="text-sm text-white/55 group-hover:text-white/80 transition-colors duration-300">{GOOGLE_REVIEW_COUNT}+ five-star Google reviews</span>
          </a>
        </div>

        {/* ─── PROGRESS BAR ───────────────────────────────────── */}
        {step !== 'done' && (
          <div ref={progressRef} className="mb-10 animate-fade-up animate-fade-up-delay-1 scroll-mt-20">
            <div className="flex items-center gap-2 mb-2.5">
              {stepLabels.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="h-1 flex-1 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-white transition-all duration-700 ease-smooth"
                      style={{ width: stepIndex >= i ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {stepLabels.map((s, i) => (
                <div key={s} className="flex-1 text-center">
                  <span className={`text-[10px] font-medium tracking-wide uppercase transition-colors duration-500 ${stepIndex >= i ? 'text-white/50' : 'text-white/20'
                    }`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 1: VEHICLE ────────────────────────────────── */}
        {step === 'vehicle' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            {activeOffer && (
              <div className="mb-8 p-4 rounded-2xl border border-accent/25 bg-accent/[0.06] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  {activeOffer.tag && <div className="text-[10px] font-semibold tracking-wider uppercase text-accent-light/80 mb-0.5">{activeOffer.tag}</div>}
                  <div className="text-sm text-white/70">{activeOffer.name}</div>
                  <div className="text-xs text-white/35">{activeOffer.desc}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display text-2xl">{activeOffer.price}</span>
                  <span className="text-xs line-through text-white/30 ml-1.5">{activeOffer.original}</span>
                </div>
              </div>
            )}

            {vStage !== 'brand' && (
              <button
                onClick={() => { if (vStage === 'model') resetVehicle(); else { setVModel(''); setOtherMode(''); setOtherText('') } }}
                className="text-sm text-white/30 hover:text-white/60 transition mb-5 flex items-center gap-2"
              >
                ← {vStage === 'model' ? 'Change brand' : 'Change model'}
              </button>
            )}

            <h2 className="font-display text-2xl md:text-3xl mb-2 text-center">
              {vStage === 'brand' ? 'What do you drive?' : vStage === 'model' ? `Which ${vBrand?.name}?` : 'What year?'}
            </h2>
            <p className="text-white/35 text-sm mb-8 text-center">
              {vStage === 'brand' ? 'Tap your brand to get started.' : vStage === 'model' ? 'Tap your model.' : `${vBrand?.name} ${vModel}`}
            </p>

            {/* Free-text fallback (Other brand / model / older year) */}
            {otherMode && (
              <div className="max-w-sm mx-auto animate-fade-up">
                <input
                  autoFocus
                  type={otherMode === 'year' ? 'tel' : 'text'}
                  inputMode={otherMode === 'year' ? 'numeric' : undefined}
                  className="booking-input"
                  placeholder={otherMode === 'brand' ? 'Year, make & model (e.g. 2022 Lexus RX)' : otherMode === 'model' ? 'Your model' : 'Year (e.g. 2008)'}
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitOther() }}
                />
                <button
                  onClick={submitOther}
                  disabled={!otherText.trim()}
                  className="btn-shine w-full mt-4 py-4 rounded-2xl bg-white text-[#0a0a0a] font-semibold text-[15px] transition-all duration-300 ease-smooth hover:translate-y-[-2px] hover:shadow-glow-white disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Continue →
                </button>
                <button onClick={() => { setOtherMode(''); setOtherText('') }} className="block mx-auto mt-4 text-sm text-white/30 hover:text-white/60 transition">
                  ← Back to the list
                </button>
              </div>
            )}

            {/* Brand bubbles */}
            {!otherMode && vStage === 'brand' && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {brandList.map((b, i) => {
                  const big = i < 7
                  return (
                    <div key={b.id} style={{ animation: `bubbleFloat ${5 + (i % 4)}s ease-in-out ${(i % 5) * 0.4}s infinite` }}>
                      <button
                        onClick={() => pickBrand(b)}
                        aria-label={b.name}
                        className={`bubble ${big ? 'w-[100px] h-[100px]' : 'w-[84px] h-[84px]'} rounded-full flex flex-col items-center justify-center gap-1.5 ${pickedBubble === b.id ? 'picked' : pickedBubble ? 'dimmed' : ''}`}
                        style={{ animation: `bubblePop 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 45}ms backwards` }}
                      >
                        {b.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.logo} alt="" className={big ? 'h-8 w-8 object-contain' : 'h-6 w-6 object-contain'} />
                        )}
                        <span className={`${b.logo ? 'text-[10px]' : 'text-[13px]'} font-medium text-white/80 leading-tight text-center px-1`}>{b.name}</span>
                      </button>
                    </div>
                  )
                })}
                <div style={{ animation: `bubbleFloat 6s ease-in-out 0.8s infinite` }}>
                  <button
                    onClick={() => showMoreBrands ? setOtherMode('brand') : setShowMoreBrands(true)}
                    className="bubble w-[84px] h-[84px] rounded-full flex items-center justify-center text-[12px] font-medium text-white/50 border-dashed"
                    style={{ animation: `bubblePop 0.55s cubic-bezier(0.16,1,0.3,1) ${brandList.length * 45}ms backwards` }}
                  >
                    {showMoreBrands ? 'Other' : '+ More'}
                  </button>
                </div>
              </div>
            )}

            {/* Model bubbles */}
            {!otherMode && vStage === 'model' && vBrand && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {[...vBrand.models, 'Other'].map((m, i) => (
                  <div key={m} style={{ animation: `bubbleFloat ${5 + (i % 3)}s ease-in-out ${(i % 4) * 0.4}s infinite` }}>
                    <button
                      onClick={() => m === 'Other' ? setOtherMode('model') : pickModel(m)}
                      className={`bubble rounded-full px-5 py-3.5 text-sm font-medium text-white/80 ${m === 'Other' ? 'border-dashed text-white/50' : ''} ${pickedBubble === m ? 'picked' : pickedBubble ? 'dimmed' : ''}`}
                      style={{ animation: `bubblePop 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms backwards` }}
                    >
                      {m}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Year bubbles */}
            {!otherMode && vStage === 'year' && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {[...years, 'Older'].map((y, i) => (
                  <div key={y} style={{ animation: `bubbleFloat ${5 + (i % 3)}s ease-in-out ${(i % 4) * 0.35}s infinite` }}>
                    <button
                      onClick={() => y === 'Older' ? setOtherMode('year') : pickYear(y)}
                      className={`bubble rounded-full ${y === 'Older' ? 'px-5 h-[60px] border-dashed text-white/50' : 'w-[64px] h-[64px]'} text-sm font-medium text-white/80 ${pickedBubble === y ? 'picked' : pickedBubble ? 'dimmed' : ''}`}
                      style={{ animation: `bubblePop 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 35}ms backwards` }}
                    >
                      {y}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {vStage === 'brand' && !otherMode && (
              <div className="mt-10">
            {/* Add-ons note */}
              <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white/30">
                <span className="text-white/50 font-medium">Add-ons available:</span> Ceramic windshield $185 · Sunroof single $80 dual $160 — mention these when you arrive.
              </div>

              {/* Wait/drop-off — answered up front so it isn't a reason to hesitate */}
              <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white/30">
                <span className="text-white/50 font-medium">Wait or drop off:</span> relax in our WiFi waiting room, or drop your car and go — most jobs are done in 1–2 hours.
              </div>

              {hiddenServices.length > 0 && (
                <div className="mt-5 text-center text-sm text-white/30">
                  {hiddenServices.map(h => (
                    service === h.id ? (
                      <button
                        key={h.id}
                        onClick={() => setService('')}
                        className="underline underline-offset-4 decoration-white/20 hover:text-white/60 transition-colors"
                      >
                        Switch back to {visibleServices[0].name}
                      </button>
                    ) : (
                      <button
                        key={h.id}
                        onClick={() => { setService(h.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="underline underline-offset-4 decoration-white/20 hover:text-white/60 transition-colors"
                      >
                        Looking for {h.name}?
                      </button>
                    )
                  ))}
                </div>
              )}

              {/* Recent work */}
              <div className="mt-10">
                <h3 className="text-xs font-medium text-white/40 tracking-wide uppercase mb-4 text-center">Recent work from our shop</h3>
                <WorkCarousel photos={WORK_PHOTOS} />
              </div>
              </div>
            )}
          </div>
        )}

        {/* ─── SERVICE (only shown when more than one special is visible) ─── */}
        {step === 'service' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <button onClick={() => setStep('info')} className="text-sm text-white/30 hover:text-white/60 transition mb-6 flex items-center gap-2">
              ← Back
            </button>

            <h2 className="font-display text-2xl mb-2">{visibleServices.length > 1 ? 'Choose Your Special' : "This Month's Special"}</h2>
            <p className="text-white/35 text-sm mb-8">{visibleServices.length > 1 ? 'Pick the one that fits your ride.' : 'Includes lifetime warranty and machine-cut precision film.'}</p>

            <div className="flex flex-col gap-3">
              {visibleServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setService(s.id); setStep('date'); }}
                  className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 ease-smooth hover:translate-y-[-3px] ${service === s.id
                      ? 'bg-white text-[#0a0a0a] border-white shadow-glow-white'
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-accent/30 hover:shadow-glow'
                    }`}
                >
                  {s.tag && (
                    <span className={`absolute top-4 right-4 text-[10px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full transition-colors duration-300 ${service === s.id
                        ? 'bg-[#0a0a0a]/10 text-[#0a0a0a]'
                        : 'bg-accent/10 text-accent-light group-hover:bg-accent/15'
                      }`}>
                      {s.tag}
                    </span>
                  )}
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-display text-3xl tracking-tight">{s.price}</span>
                    <span className={`text-sm line-through ${service === s.id ? 'text-[#0a0a0a]/30' : 'text-white/20'}`}>{s.original}</span>
                  </div>
                  <div className="text-base font-medium mb-1">{s.name}</div>
                  <div className={`text-sm ${service === s.id ? 'text-[#0a0a0a]/60' : 'text-white/35'}`}>{s.desc}</div>
                  <div className={`text-xs mt-2 ${service === s.id ? 'text-[#0a0a0a]/40' : 'text-white/20'}`}>{s.details}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 2: DATE & TIME ────────────────────────────── */}
        {step === 'date' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <button onClick={() => setStep(visibleServices.length > 1 ? 'service' : 'info')} className="text-sm text-white/30 hover:text-white/60 transition mb-6 flex items-center gap-2">
              ← Back
            </button>

            <h2 className="font-display text-2xl mb-2">Pick a Day</h2>
            <p className="text-white/35 text-sm mb-6">{selectedService?.availabilityNote ?? 'Open daily, 9AM–5PM'} · {selectedService?.name}</p>

            {/* Date cards */}
            <div className="flex md:grid md:grid-cols-7 gap-2 mb-6 overflow-x-auto md:overflow-visible snap-x scroll-pl-5 -mx-5 px-5 md:mx-0 md:px-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableDates.map(d => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d)}
                  className={`date-card shrink-0 w-[68px] md:w-auto snap-start flex flex-col items-center p-3 rounded-xl border cursor-pointer ${selectedDate?.date === d.date
                      ? 'selected'
                      : 'bg-white/[0.02] border-white/[0.08]'
                    }`}
                >
                  <span className={`date-day-name text-[10px] font-medium tracking-wide uppercase ${selectedDate?.date === d.date ? '' : 'text-white/30'
                    }`}>
                    {d.dayName}
                  </span>
                  <span className={`date-day-num font-display text-2xl ${selectedDate?.date === d.date ? '' : 'text-white'
                    }`}>
                    {d.dayNum}
                  </span>
                  <span className={`date-month text-[10px] ${selectedDate?.date === d.date ? '' : 'text-white/25'
                    }`}>
                    {d.month}
                  </span>
                  {d.isToday && (
                    <span className={`text-[8px] font-semibold tracking-wider uppercase mt-1 ${selectedDate?.date === d.date ? 'text-[#0a0a0a]/50' : 'text-white/30'
                      }`}>
                      Today
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Time slots */}
            {!selectedDate && (
              <p className="text-center text-sm text-white/30 py-6">Tap a day to see available times</p>
            )}
            {selectedDate && (
              <div ref={timesRef} className="animate-fade-up scroll-mt-24">
                <h3 className="text-sm font-medium text-white/50 mb-3">
                  Available times · {selectedDate.dayName} {selectedDate.month} {selectedDate.dayNum}
                </h3>

                {loadingSlots ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="skeleton h-[46px] rounded-xl border border-white/[0.06]" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">
                    Fully booked on this day. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`slot-btn py-3 px-4 rounded-xl border text-center text-sm font-medium ${selectedSlot === slot
                            ? 'selected'
                            : 'bg-white/[0.02] border-white/[0.08] text-white/60'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                {selectedSlot && (
                  <button
                    onClick={() => setStep('confirm')}
                    className="btn-shine w-full mt-6 py-4 rounded-2xl bg-white text-[#0a0a0a] font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 ease-smooth hover:translate-y-[-2px] hover:shadow-glow-white active:translate-y-0"
                  >
                    Continue →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: YOUR INFO ──────────────────────────────── */}
        {step === 'info' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <button onClick={() => { resetVehicle(); setStep('vehicle') }} className="text-sm text-white/30 hover:text-white/60 transition mb-6 flex items-center gap-2">
              ← Back
            </button>

            <h2 className="font-display text-2xl mb-2">Where should we reach you?</h2>
            <p className="text-white/35 text-sm mb-6">
              Next you&apos;ll pick your time. We&apos;ll only use this to contact you about your appointment.
            </p>

            <div className="mb-6 flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center gap-3 min-w-0">
                {vBrand?.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vBrand.logo} alt="" className="h-6 w-6 object-contain shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-white/30">Your vehicle</div>
                  <div className="text-sm text-white/80 truncate">{vehicle}</div>
                </div>
              </div>
              <button onClick={() => { resetVehicle(); setStep('vehicle') }} className="text-xs text-white/40 hover:text-white underline underline-offset-4 shrink-0">Change</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-white/40 tracking-wide uppercase mb-2 block">Full Name *</label>
                <input
                  type="text"
                  className="booking-input"
                  placeholder="John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/40 tracking-wide uppercase mb-2 block">Phone Number *</label>
                <input
                  type="tel"
                  className="booking-input"
                  placeholder="(832) 555-1234"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-white/40 tracking-wide uppercase mb-2 block">Preferred Shade</label>
                  <select
                    className="booking-select"
                    value={shade}
                    onChange={e => setShade(e.target.value)}
                  >
                    <option value="5%">5% — Limo Dark</option>
                    <option value="15%">15% — Dark</option>
                    <option value="20%">20% — Most Popular</option>
                    <option value="30%">30% — Medium</option>
                    <option value="50%">50% — Light</option>
                    <option value="70%">70% — Barely Visible</option>
                    <option value="undecided">Not sure yet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/40 tracking-wide uppercase mb-2 block">Existing Tint?</label>
                  <select
                    className="booking-select"
                    value={existingTint}
                    onChange={e => setExistingTint(e.target.value)}
                  >
                    <option value="no">No existing tint</option>
                    <option value="yes">Yes — needs removal</option>
                  </select>
                </div>
              </div>

              {existingTint === 'yes' && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/40 animate-fade-up">
                  ✓ Tint removal is <span className="text-white/70 font-medium">included FREE</span> with {visibleServices.length > 1 ? 'any of our specials' : 'this special'}.
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={submitInfo}
              disabled={!name || !phone}
              className="btn-shine w-full mt-8 py-4 rounded-2xl bg-white text-[#0a0a0a] font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 ease-smooth hover:translate-y-[-2px] hover:shadow-glow-white active:translate-y-0 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ─── STEP 4: CONFIRM ────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <button onClick={() => setStep('date')} className="text-sm text-white/30 hover:text-white/60 transition mb-6 flex items-center gap-2">
              ← Back
            </button>

            <h2 className="font-display text-2xl mb-6">Confirm Your Appointment</h2>

            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden mb-6">
              <div className="p-6 border-b border-white/[0.06]">
                <div className="text-xs font-medium text-white/30 tracking-wide uppercase mb-3">Service</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl">{selectedService?.name}</span>
                  <span className="text-white/50">{selectedService?.price}</span>
                </div>
                <div className="text-sm text-white/30 mt-1">{selectedService?.desc}</div>
              </div>

              <div className="p-6 border-b border-white/[0.06]">
                <div className="text-xs font-medium text-white/30 tracking-wide uppercase mb-3">Appointment</div>
                <div className="text-lg font-medium">
                  {selectedDate?.dayName}, {selectedDate?.month} {selectedDate?.dayNum} at {selectedSlot}
                </div>
                <div className="text-sm text-white/30 mt-1">
                  33619 Falcon Spring Street, Hockley TX 77447
                </div>
              </div>

              <div className="p-6 border-b border-white/[0.06]">
                <div className="text-xs font-medium text-white/30 tracking-wide uppercase mb-3">Your Info</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-white/30">Name:</span> <span className="text-white/80">{name}</span></div>
                  <div><span className="text-white/30">Phone:</span> <span className="text-white/80">{phone}</span></div>
                  <div><span className="text-white/30">Vehicle:</span> <span className="text-white/80">{vehicle}</span></div>
                  <div><span className="text-white/30">Shade:</span> <span className="text-white/80">{shade}</span></div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-xs font-medium text-white/30 tracking-wide uppercase mb-3">Deposit</div>
                <div className="text-sm text-white/50 leading-relaxed">
                  A <span className="text-white/80 font-medium">$20 deposit</span> is required to lock in your spot — it goes toward your final price. You&apos;ll pay it on the next screen, and your time slot is only reserved once it&apos;s paid.
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-shine w-full py-4 rounded-2xl bg-white text-[#0a0a0a] font-semibold text-[15px] transition-all duration-300 ease-smooth hover:translate-y-[-2px] hover:shadow-glow-white active:translate-y-0 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-[#0a0a0a]/20 border-t-[#0a0a0a]/60 rounded-full animate-spin" />
                  One moment...
                </span>
              ) : (
                'Continue to Deposit →'
              )}
            </button>

            <p className="text-center text-xs text-white/20 mt-4">
              By continuing, you agree to receive a text confirming your appointment once the deposit is paid.
            </p>
          </div>
        )}

        {/* ─── STEP 5: PAY DEPOSIT ────────────────────────────── */}
        {step === 'done' && (
          <div className="text-center animate-fade-up animate-fade-up-delay-2">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/[0.08] border border-accent/20 shadow-glow mb-6 text-5xl">
              🏁
            </div>
            <h2 className="font-display text-3xl md:text-4xl mb-3">One Step Left</h2>
            <p className="text-white/40 text-base max-w-md mx-auto mb-2 leading-relaxed">
              Your spot for <span className="text-white/80 font-medium">{selectedDate?.dayName} {selectedDate?.month} {selectedDate?.dayNum} at {selectedSlot}</span> is held but <span className="text-white/80 font-medium">not yet confirmed</span>.
            </p>
            <p className="text-white/30 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Pay the $20 deposit below to lock it in — it goes toward your final price.
            </p>

            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 max-w-sm mx-auto mb-6 text-left">
              <div className="text-xs font-medium text-white/30 tracking-wide uppercase mb-3">Appointment</div>
              <div className="text-sm text-white/70 mb-1">{selectedService?.name} · {vehicle}</div>
              <div className="text-sm text-white/40">{selectedDate?.dayName} {selectedDate?.month} {selectedDate?.dayNum} at {selectedSlot}</div>
            </div>

            {depositUrl && (
              <a
                href={depositUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-[#0a0a0a] font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 ease-smooth hover:translate-y-[-2px] hover:shadow-glow-white mb-8"
              >
                💰 Pay $20 Deposit to Confirm
              </a>
            )}

            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 max-w-sm mx-auto mb-8 text-left">
              <div className="text-xs font-medium text-white/30 tracking-wide uppercase mb-4">Next Steps</div>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-white/20 text-xs mt-0.5">01</span>
                  <span className="text-white/60">Pay the $20 deposit above — you&apos;ll get a text the moment it&apos;s confirmed</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white/20 text-xs mt-0.5">02</span>
                  <span className="text-white/60">Drive to 33619 Falcon Spring Street, Hockley TX 77447</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white/20 text-xs mt-0.5">03</span>
                  <span className="text-white/60">Drop off or wait — WiFi in the waiting room, done in 1-2 hours</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-white/25 mt-4">
              Questions? <a href={`sms:${TEXT_TEL}?&body=${encodeURIComponent('Hi! I just reserved my spot on your website.')}`} className="text-white/50 hover:text-white transition">Text us at {TEXT_DISPLAY}</a>
            </div>
          </div>
        )}

        {/* ─── TRUST BAR ──────────────────────────────────────── */}
        {step !== 'done' && (
          <div className="mt-12 pt-8 border-t border-white/[0.06] animate-fade-up animate-fade-up-delay-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/25">
              <span className="flex items-center gap-1.5"><span className="text-accent/50">✓</span> Lifetime warranty</span>
              <span className="flex items-center gap-1.5"><span className="text-accent/50">✓</span> Machine-cut precision</span>
              <span className="flex items-center gap-1.5"><span className="text-accent/50">✓</span> 5+ years experience</span>
              <span className="flex items-center gap-1.5"><span className="text-accent/50">✓</span> Free tint removal</span>
            </div>
            <div className="text-center mt-6 text-sm text-white/30">
              Questions? <a href={`sms:${TEXT_TEL}?&body=${encodeURIComponent('Hi! I have a question about window tint.')}`} className="text-white/60 underline underline-offset-4 decoration-white/20 hover:text-white transition-colors">Text us at {TEXT_DISPLAY}</a> — we usually reply in under a minute
            </div>
            <div className="text-center mt-6 text-[11px] text-white/15">
              © {new Date().getFullYear()} Pure Vision Tints · Hockley, TX
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

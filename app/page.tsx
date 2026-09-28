'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const API = 'https://purevision-backend-production.up.railway.app'
const PHONE_DISPLAY = '(832) 512-3301'
const PHONE_TEL = '+18325123301'
const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/place/PureVision+Tint/@30.0112867,-95.8206073,17z/data=!3m1!4b1!4m6!3m5!1s0x8640bf5c19b5ade3:0xe489391c99bff018!8m2!3d30.0112867!4d-95.8206073!16s%2Fg%2F11x2x2lqzf'
const GOOGLE_RATING = 5.0
const GOOGLE_REVIEW_COUNT = 127

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Step = 'service' | 'date' | 'info' | 'confirm' | 'done'

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
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState('')
  const [selectedDate, setSelectedDate] = useState<DateOption | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicle, setVehicle] = useState('')
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
      original: '$395',
      desc: 'All side windows + rear',
      details: 'HITEK Ceramic Black · Blocks 78% IR heat & 99% UV · Lifetime warranty',
      tag: 'Most Popular',
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
      // 1. Create the lead — appointment is NOT booked yet. It's only booked
      // once the $20 deposit is actually paid (see /webhooks/square on the backend).
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

      // Small delay to let the lead be created before we look it up by phone
      await new Promise(r => setTimeout(r, 2000))

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
  const availableDates = selectedService?.daysAvailable
    ? dates.filter(d => selectedService.daysAvailable!.includes(d.dow))
    : dates

  const stepIndex = ['service', 'date', 'info', 'confirm'].indexOf(step)
  const stepLabels = ['Service', 'Date', 'Info', 'Confirm']

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
            <span className="text-sm text-white/70 font-semibold">{GOOGLE_RATING}</span>
            <span className="text-white/15">·</span>
            <span className="text-sm text-white/45 group-hover:text-white/70 transition-colors duration-300">{GOOGLE_REVIEW_COUNT}+ Google Reviews</span>
          </a>
        </div>

        {/* ─── PROGRESS BAR ───────────────────────────────────── */}
        {step !== 'done' && (
          <div className="mb-10 animate-fade-up animate-fade-up-delay-1">
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

        {/* ─── STEP 1: SERVICE ────────────────────────────────── */}
        {step === 'service' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <h2 className="font-display text-2xl mb-2">{services.length > 1 ? 'Choose Your Special' : "This Month's Special"}</h2>
            <p className="text-white/35 text-sm mb-8">{services.length > 1 ? 'Pick the one that fits your ride.' : 'Includes lifetime warranty and machine-cut precision film.'}</p>

            <div className="flex flex-col gap-3">
              {services.map(s => (
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

            {/* Add-ons note */}
            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white/30">
              <span className="text-white/50 font-medium">Add-ons available:</span> Ceramic windshield $185 · Sunroof single $80 dual $160 — mention these when you arrive.
            </div>
          </div>
        )}

        {/* ─── STEP 2: DATE & TIME ────────────────────────────── */}
        {step === 'date' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <button onClick={() => setStep('service')} className="text-sm text-white/30 hover:text-white/60 transition mb-6 flex items-center gap-2">
              ← Back to specials
            </button>

            <h2 className="font-display text-2xl mb-2">Pick a Day</h2>
            <p className="text-white/35 text-sm mb-6">{selectedService?.availabilityNote ?? 'Open daily, 9AM–5PM'} · {selectedService?.name}</p>

            {/* Date cards */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-8">
              {availableDates.map(d => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d)}
                  className={`date-card flex flex-col items-center p-3 rounded-xl border cursor-pointer ${selectedDate?.date === d.date
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
            {selectedDate && (
              <div className="animate-fade-up">
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
                    onClick={() => setStep('info')}
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
            <button onClick={() => setStep('date')} className="text-sm text-white/30 hover:text-white/60 transition mb-6 flex items-center gap-2">
              ← Back to date
            </button>

            <h2 className="font-display text-2xl mb-2">Your Details</h2>
            <p className="text-white/35 text-sm mb-8">
              {selectedService?.name} · {selectedDate?.dayName} {selectedDate?.month} {selectedDate?.dayNum} at {selectedSlot}
            </p>

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

              <div>
                <label className="text-xs font-medium text-white/40 tracking-wide uppercase mb-2 block">Vehicle (Year Make Model) *</label>
                <input
                  type="text"
                  className="booking-input"
                  placeholder="2024 Toyota Camry"
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
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
                  ✓ Tint removal is <span className="text-white/70 font-medium">included FREE</span> with {services.length > 1 ? 'any of our specials' : 'this special'}.
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={() => { setError(''); setStep('confirm'); }}
              disabled={!name || !phone || !vehicle}
              className="btn-shine w-full mt-8 py-4 rounded-2xl bg-white text-[#0a0a0a] font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 ease-smooth hover:translate-y-[-2px] hover:shadow-glow-white active:translate-y-0 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Review Booking →
            </button>
          </div>
        )}

        {/* ─── STEP 4: CONFIRM ────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <button onClick={() => setStep('info')} className="text-sm text-white/30 hover:text-white/60 transition mb-6 flex items-center gap-2">
              ← Back to details
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
              Questions? Text us at <a href={`tel:${PHONE_TEL}`} className="text-white/50 hover:text-white transition">{PHONE_DISPLAY}</a>
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
            <div className="text-center mt-6 text-[11px] text-white/15">
              © {new Date().getFullYear()} Pure Vision Tints · Hockley, TX
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

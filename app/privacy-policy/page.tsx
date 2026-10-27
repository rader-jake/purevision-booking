import type { Metadata } from 'next'
import Link from 'next/link'
import LegalShell, { LegalSection } from '../LegalShell'

export const metadata: Metadata = { title: 'Privacy Policy | Pure Vision Tints' }

export default function PrivacyPolicy() {
  return (
    <LegalShell title="Privacy Policy" effective="October 26, 2026">
      <p className="mt-10 text-[15px] leading-relaxed text-white/50">
        This Privacy Policy explains how Pure Vision Tints (&ldquo;we,&rdquo; &ldquo;us&rdquo;), an automotive
        window tinting business located at 33619 Falcon Spring Street, Hockley, TX 77447, collects, uses, and
        protects your information when you submit an inquiry, book an appointment, or receive text messages from us.
      </p>

      <LegalSection title="Information we collect">
        <p>
          When you submit an inquiry through our Facebook or Instagram lead form or our booking page, we collect your
          full name, phone number, email address, vehicle year, make and model, and how soon you are looking to get
          service. We also keep the text messages you exchange with us and your appointment details. Deposits are
          processed by Square; we do not receive or store your full card number.
        </p>
      </LegalSection>

      <LegalSection title="How we use your information">
        <p>
          We use your information only to respond to your inquiry, answer your questions about our services and
          pricing, schedule your appointment, send you a secure deposit payment link, confirm your deposit, and
          remind you about your appointment.
        </p>
      </LegalSection>

      <LegalSection title="Text messaging">
        <p>
          If you agree to receive text messages, we send messages about your inquiry and appointment. Message
          frequency varies, up to 30 messages per inquiry. Message and data rates may apply. Some messages are
          written by an automated assistant that answers on our behalf. Reply <strong>HELP</strong> for help or{' '}
          <strong>STOP</strong> to opt out at any time.
        </p>
        <p>
          <strong>
            We do not sell or share your SMS opt-in data or personal information with third parties for marketing
            purposes.
          </strong>{' '}
          Text messaging originator opt-in data and consent will not be shared with any third parties, except the
          service providers that deliver our messages.
        </p>
      </LegalSection>

      <LegalSection title="Service providers">
        <p>
          We share information only with providers that help us run our business: our messaging and customer
          management providers (to send and manage text messages), Square (to process deposits), and Meta (which
          hosts our lead forms). These providers may use your information only to provide services to us.
        </p>
      </LegalSection>

      <LegalSection title="Data retention and security">
        <p>
          We keep your information only as long as needed to serve you and run our business, and we take
          reasonable measures to protect it.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can opt out of text messages at any time by replying STOP. To ask us to access, correct, or delete
          your information, call or text us at (832) 512-3301.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>Our services are not directed to children under 13, and we do not knowingly collect their information.</p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>We may update this policy. The effective date above shows when it last changed.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pure Vision Tints, 33619 Falcon Spring Street, Hockley, TX 77447 · (832) 512-3301
          <br />
          See also our <Link href="/terms">Terms and Conditions</Link>.
        </p>
      </LegalSection>
    </LegalShell>
  )
}

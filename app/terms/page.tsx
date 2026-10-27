import type { Metadata } from 'next'
import Link from 'next/link'
import LegalShell, { LegalSection } from '../LegalShell'

export const metadata: Metadata = { title: 'Terms and Conditions | Pure Vision Tints' }

export default function Terms() {
  return (
    <LegalShell title="Terms and Conditions" effective="October 26, 2026">
      <LegalSection title="Pure Vision Tints text messaging program">
        <p>
          By checking the text message consent box on our lead form, you agree to receive text messages from Pure
          Vision Tints about your window tinting inquiry. These messages include replies to your questions about our
          services and pricing, appointment scheduling, secure deposit payment links, deposit confirmations, and
          appointment reminders. Some messages are written by an automated assistant that answers on our behalf.
          Consent to receive text messages is not a condition of purchase.
        </p>
      </LegalSection>

      <LegalSection title="Message frequency and cost">
        <p>Message frequency varies, up to 30 messages per inquiry. Message and data rates may apply.</p>
      </LegalSection>

      <LegalSection title="Help and opting out">
        <p>
          <strong>Reply HELP for help. Reply STOP to opt out at any time.</strong> After you reply STOP, we will send
          one message confirming you have been unsubscribed, and you will receive no further messages unless you
          reply START to resubscribe.
        </p>
      </LegalSection>

      <LegalSection title="Customer support">
        <p>Pure Vision Tints, 33619 Falcon Spring Street, Hockley, TX 77447. Call or text (832) 512-3301.</p>
      </LegalSection>

      <LegalSection title="Carrier disclaimer">
        <p>Carriers are not liable for delayed or undelivered messages.</p>
      </LegalSection>

      <LegalSection title="Privacy">
        <p>
          Your information is handled as described in our <Link href="/privacy-policy">Privacy Policy</Link>. We do
          not sell or share your SMS opt-in data or personal information with third parties for marketing purposes.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>We may update these terms. The effective date above shows when they last changed.</p>
      </LegalSection>
    </LegalShell>
  )
}

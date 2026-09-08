import type { Metadata } from "next"
import Link from "next/link"
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-12 text-gray-800 dark:text-gray-200">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to {SITE_NAME}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-50">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: September 8, 2026</p>

        <p className="mt-6 leading-relaxed">
          {SITE_NAME} ("we," "us") provides a free chord, theory, and progression reference tool. This
          page explains what information we collect, how we use it, and your choices.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Information we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
          <li>
            <strong>Account information:</strong> if you sign in, we receive your email address and,
            for Google sign-in, your name and profile photo as provided by Google. If you sign up with
            email and password, we store your email and a securely hashed password.
          </li>
          <li>
            <strong>Content you create:</strong> chords you favorite, progressions you build and save,
            and your recent chord lookup history are stored against your account so they sync across
            devices.
          </li>
          <li>
            <strong>Public content:</strong> if you choose to publish a progression, its content and
            your display name become visible to other users in the community area.
          </li>
          <li>
            <strong>Local preferences:</strong> your theme (light/dark) and language selection are
            stored in your browser's local storage and are not sent to us.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">How we use your information</h2>
        <p className="mt-3 leading-relaxed">
          We use this information solely to operate the service: authenticating you, syncing your
          favorites/progressions/history across your devices, and displaying progressions you've chosen
          to make public. We do not sell your information, and we do not currently run advertising or
          third-party tracking/analytics on this site.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Where your data is stored</h2>
        <p className="mt-3 leading-relaxed">
          Account data and content are stored with Supabase, our database and authentication provider.
          If you sign in with Google, that authentication exchange is also subject to{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            Google's Privacy Policy
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Data retention and deletion</h2>
        <p className="mt-3 leading-relaxed">
          We retain your account and content for as long as your account is active. We don't yet have a
          self-serve account deletion button — to request deletion of your account and all associated
          data, email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>{" "}
          and we'll process it promptly.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Children's privacy</h2>
        <p className="mt-3 leading-relaxed">
          This service is not directed at children under 13, and we do not knowingly collect
          information from them.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Changes to this policy</h2>
        <p className="mt-3 leading-relaxed">
          We may update this policy as the service evolves. Material changes will update the "Last
          updated" date above.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Contact</h2>
        <p className="mt-3 leading-relaxed">
          Questions about this policy or your data? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  )
}

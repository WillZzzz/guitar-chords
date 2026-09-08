import type { Metadata } from "next"
import Link from "next/link"
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE_NAME}`,
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-12 text-gray-800 dark:text-gray-200">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to {SITE_NAME}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-50">Terms of Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: September 8, 2026</p>

        <p className="mt-6 leading-relaxed">
          These terms govern your use of {SITE_NAME} (the "Service"). By using the Service, you agree
          to these terms. This is a small, independently-run project — these terms are intentionally
          plain and may evolve as the Service grows.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">The Service</h2>
        <p className="mt-3 leading-relaxed">
          {SITE_NAME} is a free reference tool for guitar chords, music theory, and chord progressions.
          Core lookup features work without an account; creating an account lets you save favorites,
          build and store progressions, and sync your history across devices.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Your account</h2>
        <p className="mt-3 leading-relaxed">
          You're responsible for keeping your account credentials secure and for activity that happens
          under your account. Let us know at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>{" "}
          if you believe your account has been compromised.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Your content</h2>
        <p className="mt-3 leading-relaxed">
          You retain ownership of the progressions and other content you create. By marking a
          progression "public," you grant other users of the Service the ability to view it, and you
          grant us the ability to display it within the Service's community features. You're
          responsible for content you choose to publish.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Acceptable use</h2>
        <p className="mt-3 leading-relaxed">
          Don't use the Service to publish unlawful, infringing, or abusive content, or to interfere
          with the Service's normal operation (e.g. scraping at scale, attempting to bypass
          authentication, or disrupting other users). We may remove content or suspend accounts that
          violate this.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">No warranty</h2>
        <p className="mt-3 leading-relaxed">
          The Service is provided "as is," without warranties of any kind. Chord and theory information
          is provided for reference and learning purposes; we don't guarantee it is error-free.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Limitation of liability</h2>
        <p className="mt-3 leading-relaxed">
          To the fullest extent permitted by law, {SITE_NAME} and its operator aren't liable for any
          indirect, incidental, or consequential damages arising from your use of the Service.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Changes</h2>
        <p className="mt-3 leading-relaxed">
          We may update the Service or these terms over time. Continued use after changes take effect
          means you accept the updated terms.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50">Contact</h2>
        <p className="mt-3 leading-relaxed">
          Questions about these terms? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  )
}

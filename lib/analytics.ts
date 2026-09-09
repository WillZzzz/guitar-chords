import { track } from "@vercel/analytics"

// Central list of product funnel events tracked via Vercel Analytics —
// keeps event names consistent across files and gives one place to see
// what's actually being measured. Vercel Analytics is cookie-less and
// works for signed-out visitors too, which is what Supabase's own
// timestamped tables (favorites, progressions, lookups) can't tell us:
// where anonymous visitors drop off before ever creating an account.
export const AnalyticsEvents = {
  signupPromptShown: (context: "favorite_chord" | "save_progression") =>
    track("signup_prompt_shown", { context }),
  signupCompleted: (method: "email" | "google") => track("signup_completed", { method }),
  signinCompleted: (method: "email" | "google") => track("signin_completed", { method }),
  favoriteAdded: () => track("favorite_added"),
  progressionSaved: () => track("progression_saved"),
  progressionPublished: () => track("progression_published"),
}

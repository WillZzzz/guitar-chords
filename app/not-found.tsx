import Link from "next/link"
import LogoMark from "@/components/logo-mark"
import { SITE_NAME } from "@/lib/site-config"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center dark:bg-gray-950">
      <LogoMark className="h-14 w-14" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow"
        style={{ background: "linear-gradient(135deg, #bf6f4a 0%, #a05537 100%)" }}
      >
        Back to {SITE_NAME}
      </Link>
    </div>
  )
}

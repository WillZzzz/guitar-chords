"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="flex items-center justify-center gap-4">
        <Link href="/privacy" className="hover:underline hover:text-foreground">
          {t("footer.privacy")}
        </Link>
        <span aria-hidden>·</span>
        <Link href="/terms" className="hover:underline hover:text-foreground">
          {t("footer.terms")}
        </Link>
      </div>
      <p className="mt-2">{t("footer.copyright")}</p>
    </footer>
  )
}

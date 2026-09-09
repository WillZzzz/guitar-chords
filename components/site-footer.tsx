"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { TIP_JAR_URL } from "@/lib/site-config"
import { track } from "@vercel/analytics"

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
        {TIP_JAR_URL && (
          <>
            <span aria-hidden>·</span>
            <a
              href={TIP_JAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-foreground"
              onClick={() => track("tip_jar_clicked")}
            >
              {t("footer.support")}
            </a>
          </>
        )}
      </div>
      <p className="mt-2">{t("footer.copyright")}</p>
    </footer>
  )
}

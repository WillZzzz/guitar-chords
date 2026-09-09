"use client"

import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { TIP_JAR_URL } from "@/lib/site-config"
import { track } from "@vercel/analytics"

// Renders nothing until TIP_JAR_URL is set (see lib/site-config.ts). Styled
// with the terracotta accent (not a plain outline like the other header
// icon buttons) so it actually stands out as a call-to-action, per explicit
// user feedback that the footer-only link was too easy to miss.
export default function TipJarButton({ className }: { className?: string }) {
  const { t } = useLanguage()

  if (!TIP_JAR_URL) return null

  return (
    <Button
      variant="outline"
      size="icon"
      className={`border-[#bf6f4a]/40 text-[#bf6f4a] hover:bg-[#fbf4ef] hover:text-[#a05537] dark:hover:bg-slate-800 ${className ?? ""}`}
      title={t("footer.support")}
      onClick={() => {
        track("tip_jar_clicked")
        window.open(TIP_JAR_URL, "_blank", "noopener,noreferrer")
      }}
    >
      <Coffee className="h-4 w-4" />
      <span className="sr-only">{t("footer.support")}</span>
    </Button>
  )
}

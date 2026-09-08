"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type View = "tabs" | "forgot" | "reset"

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState<View>("tabs")
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, passwordRecovery, clearPasswordRecovery } = useAuth()
  const { t } = useLanguage()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const [signInData, setSignInData] = useState({ email: "", password: "" })
  const [signUpData, setSignUpData] = useState({ email: "", password: "", confirmPassword: "", displayName: "" })
  const [forgotEmail, setForgotEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  useEffect(() => {
    if (passwordRecovery) {
      setView("reset")
    }
  }, [passwordRecovery])

  const handleClose = (open: boolean) => {
    if (!open && view === "reset") {
      clearPasswordRecovery()
      setView("tabs")
      setNewPassword("")
      setConfirmNewPassword("")
    }
    onOpenChange(open)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const success = await signIn(signInData.email, signInData.password)
      if (success) {
        onOpenChange(false)
        setSignInData({ email: "", password: "" })
      }
    } catch {
      toast.error(t("msg.error-unexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error(t("msg.passwords-no-match"))
      return
    }
    if (signUpData.password.length < 6) {
      toast.error(t("msg.password-min-length"))
      return
    }
    setIsLoading(true)
    try {
      const success = await signUp(signUpData.email, signUpData.password, signUpData.displayName)
      if (success) {
        onOpenChange(false)
        setSignUpData({ email: "", password: "", confirmPassword: "", displayName: "" })
      }
    } catch {
      toast.error(t("msg.error-unexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const success = await resetPassword(forgotEmail)
      if (success) {
        toast.success(t("auth.reset-email-sent"))
        setForgotEmail("")
        setView("tabs")
      }
    } catch {
      toast.error(t("msg.error-unexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const success = await signInWithGoogle()
      if (!success) {
        setIsGoogleLoading(false)
      }
      // On success, signInWithOAuth navigates the browser away to Google, so
      // there's nothing more to do here.
    } catch {
      toast.error(t("msg.error-unexpected"))
      setIsGoogleLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      toast.error(t("msg.passwords-no-match"))
      return
    }
    if (newPassword.length < 6) {
      toast.error(t("msg.password-min-length"))
      return
    }
    setIsLoading(true)
    try {
      const success = await updatePassword(newPassword)
      if (success) {
        toast.success(t("auth.password-updated"))
        setNewPassword("")
        setConfirmNewPassword("")
        setView("tabs")
        onOpenChange(false)
      }
    } catch {
      toast.error(t("msg.error-unexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {view === "forgot" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">{t("auth.reset-password")}</DialogTitle>
              <DialogDescription className="text-center">{t("auth.reset-password-description")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t("auth.email")}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder={t("auth.email-placeholder")}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.sending") : t("auth.send-reset-link")}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setView("tabs")}>
                {t("auth.back-to-sign-in")}
              </Button>
            </form>
          </>
        )}

        {view === "reset" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">{t("auth.set-new-password")}</DialogTitle>
              <DialogDescription className="text-center">{t("auth.set-new-password-description")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("auth.new-password")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t("auth.new-password-placeholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">{t("auth.confirm-password")}</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder={t("auth.password-confirm-placeholder")}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.updating") : t("auth.update-password")}
              </Button>
            </form>
          </>
        )}

        {view === "tabs" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">{t("auth.welcome")}</DialogTitle>
            </DialogHeader>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A11.99 11.99 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
                />
              </svg>
              {isGoogleLoading ? t("auth.signing-in") : t("auth.continue-with-google")}
            </Button>
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase text-muted-foreground">{t("auth.or")}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t("auth.sign-in")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.sign-up")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t("auth.email")}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t("auth.email-placeholder")}
                      value={signInData.email}
                      onChange={(e) => setSignInData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">{t("auth.password")}</Label>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                        onClick={() => setView("forgot")}
                      >
                        {t("auth.forgot-password")}
                      </button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder={t("auth.password-placeholder")}
                      value={signInData.password}
                      onChange={(e) => setSignInData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth.signing-in") : t("auth.sign-in")}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t("auth.display-name")}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t("auth.display-name-help")}
                      value={signUpData.displayName}
                      onChange={(e) => setSignUpData((prev) => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t("auth.email")}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t("auth.email-placeholder")}
                      value={signUpData.email}
                      onChange={(e) => setSignUpData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("auth.password")}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t("auth.password-create-placeholder")}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t("auth.confirm-password")}</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder={t("auth.password-confirm-placeholder")}
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth.creating-account") : t("auth.create-account")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

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
  const { signIn, signUp, resetPassword, updatePassword, passwordRecovery, clearPasswordRecovery } = useAuth()
  const { t } = useLanguage()

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

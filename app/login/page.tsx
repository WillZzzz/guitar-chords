'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Music, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success(t('msg.welcome-back'))
        router.push('/')
      }
    } catch (error) {
      toast.error(t('msg.error-unexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signupData.password !== signupData.confirmPassword) {
      toast.error(t('msg.passwords-no-match'))
      return
    }

    if (signupData.password.length < 6) {
      toast.error(t('msg.password-min-length'))
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success(t('msg.account-created'))
        router.push('/')
      }
    } catch (error) {
      toast.error(t('msg.error-unexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            {t('header.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {t('auth.sign-in-to-continue')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('auth.welcome')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.welcome-description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('auth.continue-with-google')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('auth.or')}
                </span>
              </div>
            </div>

            {/* Email/Password Forms */}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.sign-in')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.sign-up')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t('auth.email')}
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t('auth.email-placeholder')}
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('auth.password')}
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder={t('auth.password-placeholder')}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <LogIn className="h-4 w-4 mr-2" />
                    {isLoading ? t('auth.signing-in') : t('auth.sign-in')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t('auth.email')}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('auth.email-placeholder')}
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('auth.password')}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('auth.create-password-placeholder')}
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('auth.confirm-password')}
                    </Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder={t('auth.confirm-password-placeholder')}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isLoading ? t('auth.creating-account') : t('auth.create-account')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← {t('nav.back-to-app')}
          </Button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { useRouter } from 'next/navigation'

export default function AuthCodeErrorPage() {
  const { t } = useLanguage()
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-red-600">{t('auth.error-title')}</CardTitle>
            <CardDescription>
              {t('auth.error-description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>{t('auth.error-instructions')}</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t('auth.error-check-connection')}</li>
                <li>{t('auth.error-try-again')}</li>
                <li>{t('auth.error-contact-support')}</li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={() => router.push('/login')} className="w-full">
                {t('auth.try-again')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')} 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                {t('nav.back-to-app')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
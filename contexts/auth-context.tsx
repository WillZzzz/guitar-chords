"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  created_at: string
  user_metadata?: {
    display_name?: string
    avatar_url?: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: any }>
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signInWithGoogle: () => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ? formatUser(session.user) : null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ? formatUser(session.user) : null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const formatUser = (supabaseUser: User): AuthUser => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    created_at: supabaseUser.created_at,
    user_metadata: supabaseUser.user_metadata,
  })

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      if (data.user) {
        toast.success("Account created successfully!")
      }

      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("Failed to create account")
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      if (data.user) {
        toast.success("Signed in successfully!")
      }

      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Failed to sign in")
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Google sign in error:", error)
      toast.error("Failed to sign in with Google")
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Signed out successfully!")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signUp, 
        signIn, 
        signInWithGoogle,
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

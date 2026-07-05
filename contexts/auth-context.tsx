"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase, signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const getInitialSession = async () => {
      if (!supabase) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabaseSignUp(email, password, displayName)

      if (error) {
        console.error("Sign up error:", error)
        toast.error(error.message)
        return false
      }

      if (data.user) {
        toast.success("Account created successfully! Please check your email to verify your account.")
        return true
      }

      return false
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("Failed to create account")
      return false
    }
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabaseSignIn(email, password)

      if (error) {
        console.error("Sign in error:", error)
        toast.error(error.message)
        return false
      }

      if (data.user) {
        toast.success("Signed in successfully!")
        return true
      }

      return false
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Failed to sign in")
      return false
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabaseSignOut()
      
      if (error) {
        console.error("Sign out error:", error)
        toast.error("Error signing out")
        return { error }
      }

      toast.success("Signed out successfully!")
      return { error: null }
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Failed to sign out")
      return { error }
    }
  }

  return <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

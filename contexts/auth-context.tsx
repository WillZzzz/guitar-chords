"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { type UserProfile, createUser, authenticateUser, getCurrentUser, setCurrentUser } from "@/lib/local-storage"

// TEMPORARILY REVERTED TO LOCALSTORAGE FOR PRODUCTION RELEASE
// TODO: Re-enable Supabase after environment is properly configured

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = authenticateUser(email, password)
      if (existingUser) {
        toast.error("User already exists with this email")
        return false
      }

      const newUser = createUser(email, password)
      setCurrentUser(newUser.id)
      setUser(newUser)
      toast.success("Account created successfully!")
      return true
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("Failed to create account")
      return false
    }
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = authenticateUser(email, password)
      if (authenticatedUser) {
        setCurrentUser(authenticatedUser.id)
        setUser(authenticatedUser)
        toast.success("Signed in successfully!")
        return true
      } else {
        toast.error("Invalid email or password")
        return false
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Failed to sign in")
      return false
    }
  }

  const signOut = () => {
    setCurrentUser(null)
    setUser(null)
    toast.success("Signed out successfully!")
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

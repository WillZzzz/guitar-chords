"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import AuthModal from "./auth-modal"

export default function AuthButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsModalOpen(true)}
        className="h-9 w-9"
      >
        <User className="h-4 w-4" />
        <span className="sr-only">Sign up / Sign in</span>
      </Button>
      
      <AuthModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  )
}
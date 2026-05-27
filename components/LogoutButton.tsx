'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton({
  variant = 'outline',
}: {
  variant?: 'default' | 'outline' | 'ghost'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button onClick={handleLogout} variant={variant} disabled={loading}>
      {loading ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}

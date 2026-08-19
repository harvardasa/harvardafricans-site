import type { Metadata } from 'next'
import AppChrome from '@/components/marketing/AppChrome'

export const metadata: Metadata = {
  title: {
    default: 'HASA · Harvard African Students Association',
    template: '%s · HASA',
  },
}

// Marketing-side chrome: public Navbar + Footer, plus the dark maroon→black
// gradient + light text color the marketing templates expect. Scoped here so
// the directory side keeps its existing light theme.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-gray-100 bg-gradient-to-br from-hasa-maroon to-black">
      <AppChrome>{children}</AppChrome>
    </div>
  )
}

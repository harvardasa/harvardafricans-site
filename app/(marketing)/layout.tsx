import AppChrome from '@/components/marketing/AppChrome'

// Marketing-side chrome: public Navbar + Footer. Applied to all routes inside
// the (marketing) route group only — directory and auth pages keep their own
// layouts.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <AppChrome>{children}</AppChrome>
}

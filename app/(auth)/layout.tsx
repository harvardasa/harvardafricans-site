import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import SupportFooter from '@/components/SupportFooter'

export const metadata: Metadata = {
  title: {
    default: 'HASA Alumni Directory',
    template: '%s · HASA Alumni',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-4 py-12">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-2" aria-label="HASA home">
              <Image src="/hasa-mark.svg" alt="" width={48} height={48} priority />
              <h1 className="text-2xl font-bold text-gray-900">HASA Alumni Directory</h1>
            </Link>
            <p className="text-sm text-gray-500 mt-1">Harvard African Students Association</p>
          </div>
          {children}
        </div>
      </div>
      <SupportFooter />
    </div>
  )
}

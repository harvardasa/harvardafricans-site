import SupportFooter from '@/components/SupportFooter'

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
            <h1 className="text-2xl font-bold text-gray-900">HASA Directory</h1>
            <p className="text-sm text-gray-500 mt-1">Harvard African Students Association</p>
          </div>
          {children}
        </div>
      </div>
      <SupportFooter />
    </div>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Pan-African accent stripe */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-green-700" />

      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">HASA Directory</span>
            <span className="ml-2 text-xs text-gray-500 hidden sm:inline">
              Harvard African Students Association
            </span>
          </div>
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            The HASA Alumni &amp; Member Directory
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            A members-only network for current Harvard students, alumni, faculty, and staff with
            African heritage or close ties to the African continent. Find classmates, reconnect with
            alumni, and offer or seek mentorship.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-green-700 hover:bg-green-800">
                Join the directory
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Sign-up requires a verified Harvard email. Approval typically within 24 hours.
          </p>
        </section>

        <section className="bg-gray-50 border-y">
          <div className="max-w-5xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-8">
            <Feature
              title="Members only"
              body="No public profiles. Only approved HASA members can view the directory."
            />
            <Feature
              title="Searchable & filterable"
              body="Find members by school, graduation year, country of origin, industry, and more."
            />
            <Feature
              title="Built for mentorship"
              body="Members opt in to mentoring and coffee chats. Connect with alumni who want to give back."
            />
          </div>
        </section>
      </main>

      <footer className="border-t mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Harvard African Students Association</span>
          <span className="mt-2 sm:mt-0">
            Questions? <a href="mailto:directory@hasa-harvard.org" className="underline">directory@hasa-harvard.org</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
    </div>
  )
}

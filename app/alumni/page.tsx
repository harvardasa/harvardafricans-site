import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="HASA home">
            <Image src="/hasa-logo.svg" alt="" width={225} height={264} className="h-9 w-auto" loading="eager" />
            <span className="text-xs text-gray-500 hidden sm:inline">
              Harvard&apos;s African community, since 1977.
            </span>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Find your people.
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Forty-seven years of HASA, in one searchable place. Current students, alumni who
            graduated last year, alumni who graduated decades ago, faculty who&apos;ve mentored
            generations of us. From your first African Dinner Table to wherever you&apos;ve
            ended up. This is how we stay connected.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-hasa-red hover:bg-hasa-maroon">
                Join the directory →
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Sign in with your Harvard email. We confirm you&apos;re really one of us, then
            you&apos;re in, usually within a day, often faster.
          </p>
        </section>

        <section className="bg-gray-50 border-y">
          <div className="max-w-5xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-8">
            <Feature
              title="Just us."
              body="Nobody outside HASA can see who's in here. Not Google, not recruiters, not your nosy cousin. Profiles are members-only."
            />
            <Feature
              title="Search like you mean it."
              body="Filter by school, country, industry, graduation year, language, anything. Looking for someone from Lagos working in fintech? Three clicks."
            />
            <Feature
              title="Open to talk?"
              body="Members flag whether they're up for mentorship or a coffee chat. No cold-emailing; just click on someone who already said yes."
            />
          </div>
        </section>
      </main>

      <footer className="border-t mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex flex-col sm:items-start items-center">
            <span>Built by HASA, for HASA. Since 1977.</span>
            <span className="text-xs mt-1">© {new Date().getFullYear()} Harvard African Students Association</span>
          </div>
          <span className="mt-3 sm:mt-0">
            Questions?{' '}
            <a href="mailto:inquiries@harvardafricans.com" className="underline">inquiries@harvardafricans.com</a>
            {' · '}
            Site bug?{' '}
            <a href="mailto:tech@harvardafricans.com" className="underline">tech@harvardafricans.com</a>
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

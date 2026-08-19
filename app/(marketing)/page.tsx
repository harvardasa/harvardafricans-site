import Link from 'next/link';
import Image from 'next/image';
import { getEvents } from '@/lib/marketing-content';
import { INSTAGRAM_HANDLE } from '@/lib/constants';
import EventCard from '@/components/marketing/EventCard';
import InstagramCta from '@/components/marketing/InstagramCta';

const PILLARS = [
  {
    title: 'Community',
    body: 'A home away from home for African students at Harvard, and for anyone who wants to be part of it.',
  },
  {
    title: 'Culture',
    body: 'Africa Night, feasts, craft nights, and the everyday traditions that keep the continent close.',
  },
  {
    title: 'Advocacy',
    body: 'Conversations, speakers, and partnerships that push how Africa is understood on campus and beyond.',
  },
];

export default async function Home() {
  const events = await getEvents();

  const upcomingEvents = events
    .filter((e) => e.category === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero — logo on the left, copy on the right, photo behind both */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/leadership/leadership-hero.jpg"
            alt=""
            fill
            preload
            className="object-cover object-[50%_30%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-hasa-maroon/40" />
          {/* Extra left-side falloff so the copy column stays legible over a
              busy photo without darkening the whole frame. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 min-h-[80vh] grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-center">
          <div className="flex justify-center md:justify-start">
            <Image
              src="/hasa-logo.svg"
              alt="Harvard African Students Association"
              width={225}
              height={264}
              preload
              className="w-32 md:w-44 lg:w-52 h-auto drop-shadow-2xl"
            />
          </div>

          <div className="text-center md:text-left">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg mb-6">
              Harvard African Students Association
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto md:mx-0 mb-8 text-gray-200 drop-shadow-md">
              A home away from home. Celebrating the diversity and richness of African cultures.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                href="/events"
                className="bg-hasa-red text-white px-8 py-3 rounded-md font-bold hover:bg-hasa-maroon transition-colors shadow-sm"
              >
                Upcoming Events
              </Link>
              <Link
                href="/leadership"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-bold hover:bg-white hover:text-hasa-red transition-colors shadow-sm"
              >
                Meet the Board
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-white mb-4">Who We Are</h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              HASA is dedicated to building a community for African students at Harvard and anyone interested in the continent.
              We organize cultural, social, and intellectual events to foster understanding and celebration of Africa&apos;s heritage.
            </p>
          </div>

          {/* Translucent panels rather than white cards — the Upcoming Events
              row below is already a grid of white cards. */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-black/30 border border-white/10 rounded-lg p-6"
              >
                <h3 className="font-heading text-xl font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-gray-300">{pillar.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/story" className="text-hasa-rose font-semibold hover:text-white">
              {/* The arrow is decoration. Left in the text node, VoiceOver reads
                  it out as "rightwards arrow" after the label. */}
              Read our full story <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* flex-wrap: at 320px the 30px heading and the link were fighting
              over one row, and the link lost — it collapsed to about three
              words per line. Below `sm` the link now drops to its own row. */}
          <div className="flex flex-wrap justify-between items-end gap-x-6 gap-y-3 mb-12">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white">Upcoming Events</h2>
              <p className="text-gray-300 mt-2">Join us at our next gathering</p>
            </div>
            <Link href="/events" className="text-hasa-rose font-semibold hover:text-white">
              View all events <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-10">No upcoming events scheduled at the moment. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Social CTA */}
      <section className="py-12 bg-black/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InstagramCta
            title="Stay Connected"
            body="Follow us for the latest updates, photos, and community stories."
            buttonLabel={`Follow ${INSTAGRAM_HANDLE}`}
          />
        </div>
      </section>
    </div>
  );
}

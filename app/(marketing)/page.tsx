import Link from 'next/link';
import { getEvents } from '@/lib/marketing-content';
import EventCard from '@/components/marketing/EventCard';

export default async function Home() {
  const events = await getEvents();
  
  const upcomingEvents = events
    .filter((e) => e.category === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-black text-white py-32 overflow-hidden">
        <div className="absolute inset-0">
          {/* Placeholder for hero background image */}
          <div className="absolute inset-0 bg-gradient-to-br from-hasa-maroon to-black opacity-90"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
            Harvard African Students Association
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-gray-200 drop-shadow-md">
            A home away from home. Celebrating the diversity and richness of African cultures.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/events"
              className="bg-hasa-red text-white px-8 py-3 rounded-md font-bold hover:bg-red-700 transition-colors shadow-lg"
            >
              Upcoming Events
            </Link>
            <Link
              href="/leadership"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-bold hover:bg-white hover:text-hasa-red transition-colors shadow-lg"
            >
              Meet the Board
            </Link>
          </div>
        </div>
      </section>

      {/* Social CTA Section */}
      <section className="py-12 bg-black/20 border-y border-white/5 backdrop-blur-sm text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-4">Stay Connected</h2>
          <p className="text-gray-300 mb-6">Follow us for the latest updates, photos, and community stories.</p>
          <a
            href="https://www.instagram.com/harvardafricans/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-hasa-red hover:bg-red-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow @harvardafricans
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Who We Are</h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              HASA is dedicated to building a community for African students at Harvard and anyone interested in the continent. 
              We organize cultural, social, and intellectual events to foster understanding and celebration of Africa&apos;s heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-gray-600 mt-2">Join us at our next gathering</p>
            </div>
            <Link href="/events" className="text-red-800 font-semibold hover:text-red-900">
              View all events &rarr;
            </Link>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No upcoming events scheduled at the moment. Check back soon!</p>
          )}
        </div>
      </section>
    </div>
  );
}

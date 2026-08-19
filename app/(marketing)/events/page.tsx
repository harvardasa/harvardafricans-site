import { getEvents, getSiteContent } from '@/lib/marketing-content';
import EventCard from '@/components/marketing/EventCard';
import RecentEventsSection from '@/components/marketing/RecentEventsSection';
import { isPreviewAllowed } from '@/lib/preview';

export const metadata = {
  title: 'Events',
  description: 'Upcoming and past events hosted by HASA',
};

// How many of the most recent past events get the large treatment before the
// rest drop into the archive grid.
const RECENT_COUNT = 3;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const previewMode = await isPreviewAllowed(sp);
  const events = await getEvents({ includeDrafts: previewMode });
  const siteContent = await getSiteContent();

  // Three sections, one source, no event in more than one of them.
  //
  // The page used to render Upcoming, then "Latest Events", then Past. Latest
  // came from getFeaturedEvents(), which sliced the full event list without
  // filtering, so it re-showed events that were already on the page above and
  // below it. Splitting the past events by position here means the buckets are
  // derived from a single sorted array and cannot drift apart.
  const upcomingEvents = events
    .filter((e) => e.category === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter((e) => e.category === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentEvents = pastEvents.slice(0, RECENT_COUNT);
  const archivedEvents = pastEvents.slice(RECENT_COUNT);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl font-bold text-white mb-4">Events</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {siteContent.eventsIntro}
          </p>
        </div>

        <div className="mb-20">
          <h2 className="font-heading text-2xl font-bold text-white mb-8 border-b border-hasa-red/50 pb-4">
            Upcoming Events
          </h2>

          {/* All upcoming events in one grid. This used to show the first three
              and then repeat the same card in a second grid under a "More
              Upcoming Events" heading, which split one list in two for no
              reason a reader could see. */}
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No upcoming events posted yet. Check back soon.</p>
          )}
        </div>

        <RecentEventsSection
          title="Recent Events"
          emptyMessage="Once an event has happened, it will be written up here."
          events={recentEvents}
        />

        {/* Only worth its own heading once something has aged out of Recent. */}
        {archivedEvents.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-8 border-b border-hasa-red/50 pb-4">
              Event Archive
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {archivedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { getEvents, getFeaturedEvents, getSiteContent } from '@/lib/marketing-content';
import EventCard from '@/components/marketing/EventCard';
import FeaturedEventsSection from '@/components/marketing/FeaturedEventsSection';
import { isPreviewAllowed } from '@/lib/preview';

export const metadata = {
  title: 'Events',
  description: 'Upcoming and past events hosted by HASA',
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const previewMode = await isPreviewAllowed(sp);
  const events = await getEvents({ includeDrafts: previewMode });
  const latestEvents = await getFeaturedEvents();
  const siteContent = await getSiteContent();
  
  const upcomingEvents = events
    .filter((e) => e.category === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextUpcomingEvents = upcomingEvents.slice(0, 3);
  const additionalUpcomingEvents = upcomingEvents.slice(3);
    
  const pastEvents = events
    .filter((e) => e.category === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Events</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {siteContent.eventsIntro}
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-hasa-red/50 pb-4">
            Upcoming Events
          </h2>

          {nextUpcomingEvents.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {nextUpcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {additionalUpcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">More Upcoming Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {additionalUpcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-400 italic">No upcoming events posted yet. Check back soon.</p>
          )}
        </div>

        <FeaturedEventsSection
          title="Latest Events"
          emptyMessage="No published events are available yet."
          events={latestEvents}
        />

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Past Events</h2>
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No past events to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}

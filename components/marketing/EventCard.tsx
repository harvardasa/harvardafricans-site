import { Event } from '@/lib/marketing-types';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    // Hover moves the border rather than the shadow: a drop shadow against a
    // near-black page is invisible, so it was spending a transition on nothing.
    <div className="bg-hasa-card rounded-lg overflow-hidden border border-white/10 hover:border-white/25 transition-colors">
      {event.image && (
        <div className="relative h-48 w-full">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className={`object-cover ${event.imagePosition || 'object-center'}`}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 mb-2">
          {/* Gold tint still marks "Upcoming", but the label carries the
              meaning and the text is white: gold-on-gold/20 measures 3.9:1,
              under what this size needs. */}
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
            event.category === 'upcoming' ? 'bg-hasa-gold/20 text-white' : 'bg-white/10 text-gray-200'
          }`}>
            {event.category === 'upcoming' ? 'Upcoming' : 'Past'}
          </span>
          {/* A real <time> so the date is machine-readable, matching the
              featured cards. */}
          <time dateTime={event.date} className="text-sm text-gray-300">{date}</time>
        </div>
        <h3 className="font-heading text-xl font-bold text-white mb-2">{event.title}</h3>
        <p className="text-sm text-gray-300 mb-2 flex items-center">
          {/* Decorative: the text beside it already says the location. */}
          <svg className="w-4 h-4 mr-1 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
        </p>
        <p className="text-gray-300">{event.description}</p>
      </div>
    </div>
  );
};

export default EventCard;

'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Event } from '@/lib/marketing-types';

// The richer of the two event treatments: cover photo, brand-coloured date,
// and a write-up that expands in place. Used for the handful of events that
// have already happened and are worth reading about.
//
// This was FeaturedEventsSection, fed by getFeaturedEvents(), which took every
// event, reversed it and kept 4. Because getEvents() sorts by start date
// ascending, reversing put the furthest-future events first, so "Latest Events"
// rendered the same upcoming events already shown directly above it. The
// section now has a bucket of its own and the caller owns the slicing.

interface RecentEventsSectionProps {
  title?: string;
  emptyMessage?: string;
  events: Event[];
}

export default function RecentEventsSection({
  events,
  title = 'Recent Events',
  emptyMessage = 'No events to highlight right now.',
}: RecentEventsSectionProps) {
  return (
    <section className="mb-20">
      <h2 className="font-heading text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
        {title}
      </h2>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {events.map((event) => (
            <RecentEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-gray-300 italic">{emptyMessage}</p>
      )}
    </section>
  );
}

// Below this many characters the write-up fits the card without clamping, so
// there is nothing for a "Read more" control to reveal. Three lines at this
// column width, rounded down.
const CLAMP_THRESHOLD = 180;

function RecentEventCard({ event }: { event: Event }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(event.date);

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // The toggle used to swap event.summary for event.description. Both columns
  // are populated from the same `description` field in the database, so it
  // expanded a string into an identical string and nothing moved. Clamping the
  // collapsed state gives the control something real to do, and it only renders
  // when there is actually text past the clamp.
  const body = event.description || event.summary || '';
  const isClampable = body.length > CLAMP_THRESHOLD;

  return (
    <div className="group relative bg-hasa-card border border-white/10 hover:border-white/25 rounded-lg transition-colors duration-300 overflow-hidden flex flex-col">
      {event.image && (
        <div className="relative h-48 bg-hasa-card-muted overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className={`object-cover ${event.imagePosition || 'object-center'}`}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="p-6 flex-grow flex flex-col relative z-10">
        <div className="mb-4">
          <time dateTime={event.date} className="text-sm font-semibold text-hasa-rose uppercase tracking-wider">
            {formattedDate}
          </time>
          <h3 className="font-heading text-2xl font-bold text-white mt-1 leading-tight group-hover:text-hasa-rose transition-colors">
            {event.title}
          </h3>
          {event.location && (
            <p className="text-sm text-gray-300 mt-1">{event.location}</p>
          )}
        </div>

        <div
          id={`desc-${event.id}`}
          className="text-gray-300 mb-4 flex-grow"
        >
          <p className={`leading-relaxed ${isClampable && !isExpanded ? 'line-clamp-3' : ''}`}>
            {body}
          </p>
        </div>

        {isClampable && (
          <div className="mt-auto pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={`desc-${event.id}`}
              className="text-hasa-rose font-semibold hover:text-white transition-colors flex items-center gap-1 text-sm rounded px-1 -ml-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

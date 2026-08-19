import { getGallery, getSiteContent } from '@/lib/marketing-content';
import GalleryLightbox from '@/components/marketing/GalleryLightbox';
import { isPreviewAllowed } from '@/lib/preview';

export const metadata = {
  title: 'Gallery',
  description: 'Photos from our events and community',
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const previewMode = await isPreviewAllowed(sp);
  const galleryEvents = await getGallery({ includeDrafts: previewMode });
  const siteContent = await getSiteContent();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl font-bold text-white mb-4">Gallery</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {siteContent.galleryIntro}
          </p>
        </div>

        {/* The "Follow Our Journey" Instagram panel used to sit here, between
            the page title and the first album, so the one thing this page
            exists to show started below the fold. It was also the third
            Instagram prompt a visitor could hit: the home page closes with one,
            and the footer links the account on every page. Removed rather than
            moved, since the footer already covers this page. */}

        {galleryEvents.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            No gallery images have been published yet.
          </p>
        ) : (
          <div className="space-y-12">
            {galleryEvents.map((eventGallery) => (
              <section key={eventGallery.id}>
                {/* Album names are author-supplied and can run long, so the row
                    wraps rather than crushing the date against the heading. */}
                <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-b border-white/10 pb-3">
                  <h2 className="font-heading text-2xl font-bold text-white">{eventGallery.eventName}</h2>
                  <time dateTime={eventGallery.date} className="text-sm text-gray-300">
                    {new Date(eventGallery.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>

                <GalleryLightbox
                  images={eventGallery.images}
                  albumName={eventGallery.eventName}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { getGallery, getSiteContent } from '@/lib/marketing-content';
import Image from 'next/image';
import type { GalleryImage } from '@/lib/marketing-types';
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
          <h1 className="text-4xl font-bold text-white mb-4">Gallery</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {siteContent.galleryIntro}
          </p>
        </div>

        {/* Instagram CTA */}
        <div className="mb-16 bg-black/30 border border-white/10 rounded-xl p-8 text-center backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Follow Our Journey</h2>
          <p className="text-gray-300 mb-6">
            Check out our Instagram for the latest photos and stories from the HASA community.
          </p>
          <a
            href="https://www.instagram.com/harvardafricans/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-hasa-red hover:bg-red-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Visit @harvardafricans
          </a>
        </div>

        {galleryEvents.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            No gallery images have been published yet.
          </p>
        ) : (
          <div className="space-y-12">
            {galleryEvents.map((eventGallery) => (
              <section key={eventGallery.id}>
                <div className="mb-4 flex items-end justify-between gap-3 border-b border-white/10 pb-3">
                  <h2 className="text-2xl font-bold text-white">{eventGallery.eventName}</h2>
                  <p className="text-sm text-gray-300">
                    {new Date(eventGallery.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {eventGallery.images.map((image: GalleryImage) => (
                    <div
                      key={image.id}
                      className="relative aspect-square overflow-hidden rounded-lg border border-white/5 bg-gray-900"
                    >
                      <Image
                        src={image.src}
                        alt={eventGallery.eventName}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

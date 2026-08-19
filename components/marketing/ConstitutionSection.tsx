'use client';

import { useState, useEffect, useRef } from 'react';

export default function ConstitutionSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`py-16 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-hasa-card border border-white/10 rounded-lg overflow-hidden">
          <div className="relative z-10 p-8 md:p-10">

            {/* Brand-tinted wash, now running the other way. It used to be
                rose/40 through white/20 to sand/40, which only made the largest
                light slab on the site brighter still. */}
            <div className="absolute inset-0 bg-gradient-to-br from-hasa-maroon/40 via-transparent to-black/30 pointer-events-none" />

            <div className="relative z-20">
              <h2 className="font-heading text-3xl font-bold text-white mb-6 tracking-tight">
                Governance & Constitution
              </h2>

              {/* This was a 220px-tall scroll box with a fade at the bottom.
                  The paragraph inside is a fixed 330 characters, so the box
                  never did anything on a desktop and on a phone it clipped the
                  copy to roughly half, behind a scroll region that Safari does
                  not make keyboard-reachable. Its scrollbar-* classes were
                  inert too — tailwind-scrollbar is not a dependency. Three
                  sentences do not need a viewport of their own. */}
              <p className="mb-8 max-w-[66ch] text-lg leading-relaxed text-gray-300">
                HASA is guided by a constitution that defines our mission, membership, leadership structure, and how we operate as a community. It helps keep our work consistent year to year, so traditions grow, leadership transitions stay smooth, and our events and advocacy remain grounded in shared values.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href="/documents/THE_HASA_Constitution.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-md bg-hasa-red text-white font-semibold shadow-sm hover:bg-hasa-maroon transition-colors duration-300"
                  aria-label="Read the Constitution (PDF) in a new tab"
                >
                  <svg className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Read the Constitution (PDF)
                </a>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  aria-expanded={showPreview}
                  aria-controls="pdf-preview"
                  type="button"
                  className="inline-flex items-center px-6 py-3 rounded-md bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/15 hover:border-white/35 transition-colors duration-300"
                >
                  {/* Sentence case, matching the other marketing controls. */}
                  {showPreview ? 'Hide preview' : 'Preview document'}
                </button>
              </div>
            </div>
          </div>

          {/* PDF Preview Section */}
          <div 
            id="pdf-preview"
            className={`relative border-t border-white/10 bg-hasa-card-muted transition-all duration-500 ease-in-out overflow-hidden ${
              showPreview ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Only mounted while open. Collapsed, the panel is max-h-0 and
                opacity-0 but still in the tab order, so a keyboard user landed
                inside an invisible PDF viewer with no way to tell where they
                were. Not mounting it also stops every visitor downloading the
                constitution just by loading the page. */}
            {showPreview && (
              <div className="p-4 h-[500px]">
                <iframe
                  src="/documents/THE_HASA_Constitution.pdf"
                  // bg-white stays: the PDF renders white pages, so anything
                  // else just shows as a flash before it paints.
                  className="w-full h-full rounded-lg border border-white/15 bg-white"
                  title="HASA constitution preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

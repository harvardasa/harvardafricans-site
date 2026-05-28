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
        <div 
          className="group relative bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:bg-white/70"
          style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 3D Tilt Container (Desktop Only via CSS) */}
          <div className="relative z-10 p-8 md:p-10 transition-transform duration-500 ease-out md:group-hover:[transform:rotateX(1deg)_rotateY(1deg)]">
            
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/20 to-purple-50/30 pointer-events-none" />

            <div className="relative z-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                Governance & Constitution
              </h2>

              <div className="relative max-h-[220px] overflow-y-auto pr-2 mb-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <p className="text-lg text-gray-700 leading-relaxed">
                  HASA is guided by a constitution that defines our mission, membership, leadership structure, and how we operate as a community. It helps keep our work consistent year to year—so traditions grow, leadership transitions stay smooth, and our events and advocacy remain grounded in shared values.
                </p>
                {/* Gradient Mask for Scroll Hint */}
                <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <a 
                  href="/documents/THE_HASA_Constitution.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  aria-label="Read the Constitution (PDF) in a new tab"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Read the Constitution (PDF)
                </a>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  aria-expanded={showPreview}
                  aria-controls="pdf-preview"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-700 font-semibold border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-300"
                >
                  {showPreview ? 'Hide Preview' : 'Preview Document'}
                </button>
              </div>
            </div>
          </div>

          {/* PDF Preview Section */}
          <div 
            id="pdf-preview"
            className={`relative border-t border-gray-100 bg-gray-50 transition-all duration-500 ease-in-out overflow-hidden ${
              showPreview ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 h-[500px]">
              <iframe 
                src="/documents/THE_HASA_Constitution.pdf" 
                className="w-full h-full rounded-lg border border-gray-200 shadow-inner bg-white"
                title="HASA Constitution Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

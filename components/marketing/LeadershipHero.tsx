'use client';

import { useEffect, useRef, useState } from 'react';

export default function LeadershipHero() {
  const [offset, setOffset] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* Content - Glass Panel */}
      <div 
        className={`
            relative z-20 max-w-4xl mx-4 p-8 md:p-12 rounded-3xl 
            border border-white/10 backdrop-blur-xl bg-white/5 shadow-2xl 
            transition-all duration-1000 ease-out
            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}
        style={{
          transform: isLoaded ? `perspective(1000px) rotateX(${mousePosition.y * -2}deg) rotateY(${mousePosition.x * 2}deg) translateY(${offset * -0.1}px)` : undefined,
        }}
      >
        {/* Subtle glow effect behind the panel */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10 opacity-50" />

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight drop-shadow-lg">
          Our Leadership
        </h1>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light drop-shadow-md">
          Our leaders come from different countries, cultures, and lived experiences across the African continent and its global diaspora. Together, they bring diverse perspectives, shared purpose, and a deep commitment to building community, celebrating culture, and supporting one another at Harvard.
        </p>
      </div>
      
      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-500 ${offset > 50 ? 'opacity-0' : 'opacity-70'}`}
      >
        <div className="animate-bounce text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

import type { SVGProps } from 'react';

/**
 * Simple outline Instagram mark — rounded square, lens, flash dot.
 *
 * Hand-rolled rather than imported: lucide-react v1 dropped its brand/social
 * icons, and the previous inline glyph here was the heavy filled version.
 * Strokes inherit `currentColor`, so it picks up whatever text colour it sits in.
 */
export default function InstagramIcon({
  className = '',
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

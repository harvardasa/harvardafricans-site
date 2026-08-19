import InstagramIcon from './InstagramIcon';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/constants';

const Footer = () => {
  return (
    <footer className="bg-hasa-maroon text-white border-t border-hasa-red/30 relative z-10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* h2, not h3. The contact page has no h2 of its own, so the footer
              jumped straight from h1 to h3 there and broke the outline for
              anyone navigating by heading. */}
          <div>
            <h2 className="font-heading text-lg font-semibold mb-4 text-hasa-rose">HASA</h2>
            <p className="text-gray-200">
              Harvard African Students Association
              <br />
              Celebrating African culture and community at Harvard.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold mb-4 text-hasa-rose">Connect</h2>
            <ul className="space-y-2 mb-6">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`HASA on Instagram, ${INSTAGRAM_HANDLE} (opens in a new tab)`}
                  className="text-gray-200 hover:text-white transition-colors flex items-center"
                >
                  <InstagramIcon className="w-4 h-4 mr-2 shrink-0" />
                  <span className="mr-2">Instagram</span>
                  <span className="text-xs text-hasa-rose bg-white/10 px-2 py-0.5 rounded-full">{INSTAGRAM_HANDLE}</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold mb-4 text-hasa-rose">Contact</h2>
            <ul className="text-gray-200 space-y-1">
              <li>
                General:{' '}
                <a href="mailto:inquiries@harvardafricans.com" className="hover:text-white underline">
                  inquiries@harvardafricans.com
                </a>
              </li>
              <li>
                Tech / site issues:{' '}
                <a href="mailto:tech@harvardafricans.com" className="hover:text-white underline">
                  tech@harvardafricans.com
                </a>
              </li>
              <li className="pt-1">Cambridge, MA</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} Harvard African Students Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

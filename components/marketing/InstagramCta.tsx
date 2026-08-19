import InstagramIcon from './InstagramIcon';
import { INSTAGRAM_URL } from '@/lib/constants';

interface InstagramCtaProps {
  title: string;
  body: string;
  buttonLabel: string;
  className?: string;
}

export default function InstagramCta({ title, body, buttonLabel, className = '' }: InstagramCtaProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="font-heading text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-300 mb-6">{body}</p>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        // target="_blank" with no warning drops people onto Instagram in a new
        // tab with no clue the site is still behind them.
        aria-label={`${buttonLabel} on Instagram (opens in a new tab)`}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-hasa-red hover:bg-hasa-maroon transition-colors shadow-sm"
      >
        <InstagramIcon className="w-5 h-5 mr-2" />
        {buttonLabel}
      </a>
    </div>
  );
}

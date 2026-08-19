import { Leader } from '@/lib/marketing-types';
import Image from 'next/image';

interface LeaderCardProps {
  leader: Leader;
}

const LeaderCard = ({ leader }: LeaderCardProps) => {
  return (
    <div className="bg-hasa-card rounded-lg overflow-hidden border border-white/10 hover:border-white/25 transition-colors duration-300">
      <div className="relative h-64 w-full bg-hasa-card-muted">
        <Image
          src={leader.image || '/images/placeholder.jpg'}
          alt={leader.name}
          fill
          // Without `sizes`, a `fill` image is served at full viewport width to
          // every card in a three-up grid.
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className={`${leader.imageFit || 'object-cover'} ${leader.imagePosition || 'object-center'}`}
        />
      </div>
      <div className="p-6">
        <h3 className="font-heading text-xl font-bold text-white">{leader.name}</h3>
        {/* Brand red measures 1.5:1 on the card surface. Rose is the same brand
            family at 7.6:1, and it is what the accent becomes inside a card. */}
        <p className="text-hasa-rose font-medium mb-2">{leader.role}</p>
        <p className="text-gray-300 text-sm mb-4">{leader.bio}</p>
        {/* These were gray-400 on white — 2.5:1, roughly half the contrast body
            text needs, on the only two controls the card has. Rose clears 7.6:1
            on the card surface and reads as a link besides.

            The visible text stays short, but "Email" repeated down a board of
            fifteen cards is useless in a screen reader's link list, so each one
            carries the leader's name in its accessible name. */}
        <div className="flex space-x-4 text-sm font-semibold">
          {leader.email && (
            <a
              href={`mailto:${leader.email}`}
              aria-label={`Email ${leader.name}`}
              className="text-hasa-rose hover:text-white hover:underline"
            >
              Email
            </a>
          )}
          {leader.linkedin && (
            <a
              href={leader.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${leader.name} on LinkedIn (opens in a new tab)`}
              className="text-hasa-rose hover:text-white hover:underline"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderCard;

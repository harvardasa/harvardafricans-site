import Image from 'next/image';
import { getLeaders, getSiteContent } from '@/lib/marketing-content';
import LeadershipBoards from '@/components/marketing/LeadershipBoards';
import LeadershipHero from '@/components/marketing/LeadershipHero';

export const metadata = {
  title: 'Leadership',
  description: 'Meet the HASA Executive Board',
};

export default async function LeadershipPage() {
  const [leaders, siteContent] = await Promise.all([getLeaders(), getSiteContent()]);

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/leadership/leadership-hero.jpg"
          alt=""
          fill
          // `priority` is deprecated in Next 16 in favour of `preload`.
          preload
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark overlay for readability across the whole page */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <LeadershipHero />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LeadershipBoards
            leaders={leaders}
            currentAcademicYear={siteContent.leadershipCurrentYear}
          />
        </div>
      </div>
    </div>
  );
}

import { getSiteContent } from '@/lib/marketing-content';
import ConstitutionSection from '@/components/marketing/ConstitutionSection';

export const metadata = {
  title: 'Our Story',
  description: 'The history and mission of the Harvard African Students Association',
};

export default async function StoryPage() {
  const siteContent = await getSiteContent();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl font-bold text-white">Our Story</h1>
        </div>

        {/* This carried `prose prose-lg`, but @tailwindcss/typography is not a
            dependency, so both classes compiled to nothing and the longest body
            copy on the site ran the full 832px of the card — around 90
            characters a line, well past the point where the eye starts losing
            its place returning to the left margin. The measure and rhythm are
            set explicitly here instead of reaching for the plugin, which would
            need its own dark-mode inversion to work on this background. */}
        <div className="mx-auto mb-16 rounded-lg border border-white/10 bg-black/40 p-8 shadow-sm">
          <div className="max-w-[66ch] text-lg leading-relaxed text-gray-300">
            <p className="mb-6">
              {siteContent.storyIntro}
            </p>

            <h2 className="font-heading text-2xl font-bold text-white mt-8 mb-4">{siteContent.storyMissionTitle}</h2>
            <p className="mb-6">
              {siteContent.storyMissionBody}
            </p>

            <h2 className="font-heading text-2xl font-bold text-white mt-8 mb-4">{siteContent.storyActivitiesTitle}</h2>
            <p className="mb-6">
              {siteContent.storyActivitiesIntro}
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-hasa-red">
              {siteContent.storyActivities.map((activity: string) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <ConstitutionSection />
    </div>
  );
}

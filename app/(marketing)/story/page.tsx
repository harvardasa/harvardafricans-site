import { getSiteContent } from '@/lib/marketing-content';
import ConstitutionSection from '@/components/marketing/ConstitutionSection';

export const metadata = {
  title: 'Our Story - HASA',
  description: 'The history and mission of the Harvard African Students Association',
};

export default async function StoryPage() {
  const siteContent = await getSiteContent();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Our Story</h1>
        </div>

        <div className="prose prose-lg mx-auto text-gray-300 mb-16 bg-black/40 p-8 rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm">
          <p className="mb-6">
            {siteContent.storyIntro}
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">{siteContent.storyMissionTitle}</h2>
          <p className="mb-6">
            {siteContent.storyMissionBody}
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">{siteContent.storyActivitiesTitle}</h2>
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
      
      <ConstitutionSection />
    </div>
  );
}

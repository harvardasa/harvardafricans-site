import ContactForm from '@/components/marketing/ContactForm';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with HASA',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl font-bold text-white mb-4">Contact Us</h1>
          {/* Was "Have questions? Want to collaborate? Reach out to us!" —
              three fragments that ask the reader questions instead of telling
              them anything. What they actually want to know before writing is
              who reads this and how long a reply takes. */}
          <p className="text-xl text-gray-300">
            Questions, collaborations, or press: the board reads every message.
          </p>
        </div>

        <div className="bg-hasa-card border border-white/10 rounded-lg p-8">
          <ContactForm />
        </div>

        <div className="mt-12 text-center space-y-2">
          <p className="text-gray-300">
            Or email us directly:
          </p>
          <p className="text-gray-200">
            General inquiries:{' '}
            <a href="mailto:inquiries@harvardafricans.com" className="text-hasa-rose font-medium underline">
              inquiries@harvardafricans.com
            </a>
          </p>
          <p className="text-gray-200">
            Tech / site issues:{' '}
            <a href="mailto:tech@harvardafricans.com" className="text-hasa-rose font-medium underline">
              tech@harvardafricans.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

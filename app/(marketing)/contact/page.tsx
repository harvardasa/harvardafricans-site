export const metadata = {
  title: 'Contact',
  description: 'Get in touch with HASA',
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Have questions? Want to collaborate? Reach out to us!
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-12 text-center space-y-2">
          <p className="text-gray-600">
            Or email us directly:
          </p>
          <p className="text-gray-700">
            General inquiries —{' '}
            <a href="mailto:inquiries@harvardafricans.com" className="text-red-800 font-medium underline">
              inquiries@harvardafricans.com
            </a>
          </p>
          <p className="text-gray-700">
            Tech / site issues —{' '}
            <a href="mailto:tech@harvardafricans.com" className="text-red-800 font-medium underline">
              tech@harvardafricans.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

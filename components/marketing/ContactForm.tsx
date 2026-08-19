'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name')?.toString() ?? '';
    const email = form.get('email')?.toString() ?? '';
    const message = form.get('message')?.toString() ?? '';

    const subject = `Message from ${name || 'the HASA website'}`;
    const body = `${message}\n\nFrom: ${name} (${email})`;
    window.location.href = `mailto:inquiries@harvardafricans.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-200">
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            autoComplete="name"
            className="block w-full rounded-md border border-white/20 bg-hasa-card-muted p-2 text-white placeholder:text-gray-400 sm:text-sm"
            // No placeholder: it read "Your Name", which only repeats the label
            // above it and then disappears the moment anyone starts typing.
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200">
          Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            name="email"
            id="email"
            required
            autoComplete="email"
            className="block w-full rounded-md border border-white/20 bg-hasa-card-muted p-2 text-white placeholder:text-gray-400 sm:text-sm"
            // Kept, because it shows the expected format rather than restating
            // the label.
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-200">
          Message
        </label>
        <div className="mt-1">
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="block w-full rounded-md border border-white/20 bg-hasa-card-muted p-2 text-white placeholder:text-gray-400 sm:text-sm"
            placeholder="How can we help you?"
          />
        </div>
      </div>

      <div>
        {/* This form does not send anything: it hands the text to the visitor's
            mail client over a mailto: link, and they still have to press send
            there. "Send message" promised something the button cannot do, and
            anyone without a mail client configured saw nothing happen at all.
            Saying so up front costs one line and removes the dead end. */}
        <p className="mb-3 text-sm text-gray-300">
          This opens the message in your own email app, ready to send.
        </p>
        <button
          type="submit"
          // Hover goes lighter, not darker: hasa-maroon is darker than the card
          // it now sits on, so the old hover read as the button switching off.
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-hasa-red hover:bg-[#B4453F] transition-colors"
        >
          Open in email app
        </button>
        {/* role="status" so the confirmation is announced. It appears well
            below the button after a click, so a screen-reader user otherwise
            has no way to know anything happened. */}
        <p role="status" className="mt-3 min-h-5 text-sm text-hasa-rose text-center">
          {submitted
            ? 'Your email app should be opening now. If nothing happened, email us directly below.'
            : ''}
        </p>
      </div>
    </form>
  );
}

import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderSignup({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Verify your HASA email`,
    html: shell({
      heading: 'Welcome to HASA.',
      body: `<p style="margin:0;">
        Confirm <strong>${email}</strong> is yours and we&apos;ll get you signed up.
        The link works for 10 minutes.
      </p>`,
      buttonLabel: 'Confirm email',
      buttonUrl: confirmationUrl,
      footerNote: `Didn't try to sign up? Ignore this email. We won't create anything.`,
      token,
    }),
  }
}

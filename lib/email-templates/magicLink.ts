import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderMagicLink({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Sign in to HASA`,
    html: shell({
      heading: 'Your sign-in link',
      body: `<p style="margin:0;">
        Click below to verify <strong>${email}</strong>. The link works for 10 minutes,
        one click only.
      </p>`,
      buttonLabel: 'Sign in',
      buttonUrl: confirmationUrl,
      token,
    }),
  }
}

import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderMagicLink({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Sign in to HASA`,
    html: shell({
      heading: 'Sign in to HASA Directory',
      body: `<p style="margin:0;">
        Click below to sign in as <strong>${email}</strong>. This link expires in 10 minutes
        and can only be used once.
      </p>`,
      buttonLabel: 'Sign in',
      buttonUrl: confirmationUrl,
      token,
    }),
  }
}

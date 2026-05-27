import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderRecovery({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Reset your HASA password`,
    html: shell({
      heading: 'Reset your HASA Directory password',
      body: `<p style="margin:0;">
        We received a request to reset the password for <strong>${email}</strong>.
        Click below to choose a new one — this link expires in 10 minutes.
      </p>`,
      buttonLabel: 'Reset password',
      buttonUrl: confirmationUrl,
      token,
    }),
  }
}

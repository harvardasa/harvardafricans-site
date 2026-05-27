import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderEmailChange({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Confirm your new HASA email`,
    html: shell({
      heading: 'Confirm your new HASA Directory email',
      body: `<p style="margin:0;">
        Click below to confirm <strong>${email}</strong> as your new sign-in email for HASA Directory.
        This link expires in 10 minutes.
      </p>`,
      buttonLabel: 'Confirm new email',
      buttonUrl: confirmationUrl,
      token,
    }),
  }
}

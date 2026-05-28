import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderEmailChange({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Confirm your new HASA email`,
    html: shell({
      heading: 'Confirm your new HASA email',
      body: `<p style="margin:0;">
        You asked to change your HASA email to <strong>${email}</strong>. Click below to confirm.
        Link expires in 10 minutes.
      </p>`,
      buttonLabel: 'Confirm new email',
      buttonUrl: confirmationUrl,
      token,
    }),
  }
}

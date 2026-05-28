import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderRecovery({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Reset your HASA password`,
    html: shell({
      heading: 'Reset your password',
      body: `<p style="margin:0;">
        Someone (hopefully you) asked to reset the password for <strong>${email}</strong>.
        Click below to pick a new one. The link works for 10 minutes.
      </p>`,
      buttonLabel: 'Reset password',
      buttonUrl: confirmationUrl,
      footerNote: `Wasn't you? Just ignore this. Nothing changes unless you click the link.`,
      token,
    }),
  }
}

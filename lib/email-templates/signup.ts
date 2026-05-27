import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderSignup({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} Verify your HASA email`,
    html: shell({
      heading: 'Verify your HASA Directory email',
      body: `<p style="margin:0;">
        Click below to confirm <strong>${email}</strong> and finish setting up your account.
        This link expires in 10 minutes.
      </p>`,
      buttonLabel: 'Verify email',
      buttonUrl: confirmationUrl,
      footerNote: `Didn't try to sign up? Ignore this email and we won't create an account.`,
      token,
    }),
  }
}

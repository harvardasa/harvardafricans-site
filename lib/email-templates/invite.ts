import type { RenderedEmail, TemplateInput } from './index'
import { subjectPrefix } from './index'
import { shell } from './_shared'

export function renderInvite({ email, confirmationUrl, token }: TemplateInput): RenderedEmail {
  return {
    subject: `${subjectPrefix(token)} You're invited to HASA Directory`,
    html: shell({
      heading: 'Welcome to HASA Directory',
      body: `<p style="margin:0;">
        You've been invited to join HASA Directory as <strong>${email}</strong>.
        Click below to set up your account.
      </p>`,
      buttonLabel: 'Accept invitation',
      buttonUrl: confirmationUrl,
      token,
    }),
  }
}

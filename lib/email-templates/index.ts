import { renderRecovery } from './recovery'
import { renderSignup } from './signup'
import { renderMagicLink } from './magicLink'
import { renderEmailChange } from './emailChange'
import { renderInvite } from './invite'

export type EmailActionType =
  | 'signup'
  | 'recovery'
  | 'magiclink'
  | 'email_change'
  | 'email_change_current'
  | 'email_change_new'
  | 'invite'

export type TemplateInput = {
  email: string
  confirmationUrl: string
  token: string
  tokenHash: string
}

export type RenderedEmail = {
  subject: string
  html: string
}

export function renderEmail(action: EmailActionType, input: TemplateInput): RenderedEmail {
  switch (action) {
    case 'recovery':
      return renderRecovery(input)
    case 'signup':
      return renderSignup(input)
    case 'magiclink':
      return renderMagicLink(input)
    case 'email_change':
    case 'email_change_current':
    case 'email_change_new':
      return renderEmailChange(input)
    case 'invite':
      return renderInvite(input)
  }
}

// Short prefix on the subject line defeats Gmail's subject normalization.
// The real anti-threading signal is the X-Entity-Ref-ID header set in the
// webhook route — this is belt-and-suspenders.
export function subjectPrefix(token: string): string {
  return `[${token.slice(0, 8)}]`
}

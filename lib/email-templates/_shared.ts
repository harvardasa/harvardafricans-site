// Shared HTML chrome for all transactional emails. Renderers pass in
// per-template content; this wraps it in a consistent layout.

export type ShellInput = {
  heading: string
  body: string                  // raw HTML allowed
  buttonLabel: string
  buttonUrl: string
  footerNote?: string           // optional small grey footer paragraph
  token: string                 // included as Request reference + breaks Gmail threading
}

const GREEN = '#15803d'

export function shell({ heading, body, buttonLabel, buttonUrl, footerNote, token }: ShellInput): string {
  const safeFooter =
    footerNote ??
    `Didn't trigger this? You can safely ignore this email — nothing will change unless you click the link above.`

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://harvardafricans.com'

  return `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f9fafb;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#374151;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
    <tr><td>
      <div style="text-align:center;margin:0 0 16px;">
        <a href="${siteUrl}" style="text-decoration:none;">
          <img src="${siteUrl}/hasa-logo.svg" alt="HASA" width="160" height="53" style="display:inline-block;max-width:100%;height:auto;"/>
        </a>
      </div>
      <h2 style="margin:0 0 16px;color:#0a0a0a;font-size:20px;">${heading}</h2>
      <div style="font-size:14px;line-height:1.6;">${body}</div>
      <p style="margin:28px 0;">
        <a href="${buttonUrl}"
           style="display:inline-block;padding:12px 22px;background:${GREEN};color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">
          ${buttonLabel}
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;margin:0 0 8px;">
        If the button doesn't work, paste this URL into your browser:
      </p>
      <p style="font-size:12px;color:#6b7280;margin:0;word-break:break-all;">
        <a href="${buttonUrl}" style="color:${GREEN};">${buttonUrl}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
      <p style="font-size:12px;color:#9ca3af;margin:0 0 8px;">${safeFooter}</p>
      <p style="font-size:11px;color:#9ca3af;margin:0;">
        Request reference: <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;">${token}</code>
        &nbsp;·&nbsp; HASA Directory
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

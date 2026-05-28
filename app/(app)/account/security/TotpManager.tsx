'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateAndEmailBackupCodes } from '@/app/actions/mfa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TotpManager({
  enrolled: initialEnrolled,
  factorId: initialFactorId,
  unusedBackupCodes,
}: {
  enrolled: boolean
  factorId: string | null
  unusedBackupCodes: number
}) {
  const [enrolled, setEnrolled] = useState(initialEnrolled)
  const [factorId, setFactorId] = useState<string | null>(initialFactorId)
  const [phase, setPhase] = useState<'idle' | 'enrolling' | 'verifying'>('idle')
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [remainingCodes, setRemainingCodes] = useState(unusedBackupCodes)

  const supabase = createClient()

  const beginEnroll = async () => {
    setBusy(true)
    setErr(null)
    setMsg(null)
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `HASA Admin — ${new Date().toISOString().split('T')[0]}`,
    })
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    setQr(data.totp.qr_code)
    setSecret(data.totp.secret)
    setPendingFactorId(data.id)
    setPhase('verifying')
  }

  const verifyEnroll = async () => {
    if (!pendingFactorId || !code) return
    setBusy(true)
    setErr(null)
    const challenge = await supabase.auth.mfa.challenge({ factorId: pendingFactorId })
    if (challenge.error) {
      setBusy(false)
      setErr(challenge.error.message)
      return
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: challenge.data.id,
      code,
    })
    setBusy(false)
    if (verifyError) {
      setErr('Code didn\'t match. Try again — codes refresh every 30s.')
      return
    }
    setEnrolled(true)
    setFactorId(pendingFactorId)
    setPhase('idle')
    setQr(null)
    setSecret(null)
    setPendingFactorId(null)
    setCode('')

    // Auto-generate backup codes on first enrollment so the admin sees them
    // immediately + a copy goes to their recovery email.
    const result = await generateAndEmailBackupCodes()
    if (result.ok) {
      setBackupCodes(result.codes)
      setRemainingCodes(result.codes.length)
      setMsg('Two-factor authentication enabled. Save these backup codes!')
    } else {
      setMsg('Two-factor authentication enabled. (Backup code generation failed — try the "Regenerate" button below.)')
    }
  }

  const regenerateBackupCodes = async () => {
    if (!confirm('Generate a fresh set of backup codes? Any unused codes you have now will stop working.')) return
    setBusy(true)
    setErr(null)
    const result = await generateAndEmailBackupCodes()
    setBusy(false)
    if (!result.ok) {
      setErr(result.error)
      return
    }
    setBackupCodes(result.codes)
    setRemainingCodes(result.codes.length)
    setMsg('Backup codes regenerated. Save the new ones — old codes no longer work.')
  }

  const disable = async () => {
    if (!factorId) return
    if (!confirm('Disable two-factor authentication? This makes your account less secure.')) return
    setBusy(true)
    setErr(null)
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    setMsg('Two-factor authentication disabled.')
    setEnrolled(false)
    setFactorId(null)
  }

  if (enrolled) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          <p className="font-medium">Two-factor authentication is ON.</p>
          <p className="mt-1">
            On every sign-in we&apos;ll ask for a 6-digit code from your authenticator app.
          </p>
        </div>
        {msg && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>
        )}
        {err && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>
        )}

        {backupCodes && (
          <div className="rounded-md border-2 border-amber-400 bg-amber-50 p-4 space-y-3">
            <div>
              <p className="font-semibold text-amber-900">Save these backup codes NOW</p>
              <p className="text-sm text-amber-900 mt-1">
                Each one lets you sign in once if you lose access to your authenticator app.
                We&apos;ll never show them again — copy them, screenshot them, or use the email copy.
              </p>
            </div>
            <pre className="bg-white border border-amber-200 rounded p-3 font-mono text-sm leading-relaxed">
{backupCodes.join('\n')}
            </pre>
            <p className="text-xs text-amber-800">
              A copy was also emailed to your recovery email. Treat these like a password.
            </p>
            <Button variant="outline" size="sm" onClick={() => setBackupCodes(null)}>
              I&apos;ve saved them
            </Button>
          </div>
        )}

        <div className="rounded-md border bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Backup codes</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {remainingCodes} unused {remainingCodes === 1 ? 'code' : 'codes'} remaining.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={regenerateBackupCodes} disabled={busy}>
              {busy ? 'Generating…' : 'Regenerate codes'}
            </Button>
          </div>
        </div>

        <Button variant="outline" onClick={disable} disabled={busy} className="text-red-700 border-red-200 hover:bg-red-50">
          {busy ? 'Disabling…' : 'Disable two-factor'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
        <p className="font-medium">Two-factor authentication is OFF.</p>
        <p className="mt-1">
          Recommended for admin accounts. Takes ~30 seconds: scan a QR code with your authenticator app, enter a 6-digit code to verify.
        </p>
      </div>

      {msg && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>
      )}
      {err && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>
      )}

      {phase === 'idle' && (
        <Button onClick={beginEnroll} disabled={busy}>
          {busy ? 'Preparing…' : 'Enable two-factor'}
        </Button>
      )}

      {phase === 'verifying' && qr && (
        <div className="rounded-md border bg-white p-4 space-y-4">
          <div>
            <p className="font-medium text-gray-900 mb-2">Scan this QR with your authenticator app</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="TOTP QR code" className="w-48 h-48 border rounded" />
          </div>
          {secret && (
            <p className="text-xs text-gray-500">
              Can&apos;t scan? Paste this secret manually:{' '}
              <code className="bg-gray-100 px-2 py-0.5 rounded font-mono break-all">{secret}</code>
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="code">6-digit code from your app</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              autoComplete="one-time-code"
              inputMode="numeric"
              className="font-mono text-lg tracking-widest"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={verifyEnroll} disabled={busy || code.length !== 6}>
              {busy ? 'Verifying…' : 'Verify and enable'}
            </Button>
            <Button variant="outline" onClick={() => { setPhase('idle'); setQr(null); setSecret(null); setPendingFactorId(null); setCode('') }} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

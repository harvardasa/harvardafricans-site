'use client'

import { Fragment, useState, useTransition } from 'react'
import { approveProfile, rejectProfile } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/types'

export default function AdminApprovalQueue({ profiles }: { profiles: Profile[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleApprove = (id: string) => {
    setError(null)
    startTransition(async () => {
      const r = await approveProfile(id)
      if (r && 'error' in r) setError(r.error ?? null)
    })
  }

  const handleReject = (id: string) => {
    const reason = window.prompt('Reason for rejection (optional — shown only in audit log):')
    if (reason === null) return
    setError(null)
    startTransition(async () => {
      const r = await rejectProfile(id, reason || undefined)
      if (r && 'error' in r) setError(r.error ?? null)
    })
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
        No pending applications.
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm border-b border-red-200">
          {error}
        </div>
      )}
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">School</th>
            <th className="px-4 py-2 font-medium">Country</th>
            <th className="px-4 py-2 font-medium">Submitted</th>
            <th className="px-4 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {profiles.map((p) => (
            <Fragment key={p.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">{p.first_name} {p.last_name}</td>
                <td className="px-4 py-3 text-gray-600">{p.email}</td>
                <td className="px-4 py-3">{p.harvard_school}</td>
                <td className="px-4 py-3">{p.country_of_origin}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  >
                    {expanded === p.id ? 'Hide' : 'View'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(p.id)}
                    disabled={isPending}
                    className="bg-green-700 hover:bg-green-800"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(p.id)}
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
              {expanded === p.id && (
                <tr className="bg-gray-50">
                  <td colSpan={6} className="px-4 py-4">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <Detail k="Affiliation" v={p.affiliation_type} />
                      <Detail k="Degree" v={p.degree} />
                      <Detail k="Field" v={p.concentration_field} />
                      <Detail k="Grad year" v={p.graduation_year} />
                      <Detail k="Current role" v={p.job_title} />
                      <Detail k="Company" v={p.current_company} />
                      <Detail k="Industry" v={p.industry} />
                      <Detail k="Location" v={[p.city, p.country_of_residence].filter(Boolean).join(', ')} />
                      <Detail k="LinkedIn" v={p.linkedin_url} />
                      <Detail k="Website" v={p.personal_website} />
                      <Detail k="Bio" v={p.short_bio} span />
                    </dl>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Detail({ k, v, span }: { k: string; v: React.ReactNode; span?: boolean }) {
  if (!v) return null
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-gray-500">{k}</dt>
      <dd className="text-gray-900">{v}</dd>
    </div>
  )
}

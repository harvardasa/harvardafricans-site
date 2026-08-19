'use client'

import { useState, useMemo, useTransition } from 'react'
import { promoteToAdmin, demoteToMember, deleteMember } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/lib/types'

export default function AdminMembersTable({ profiles }: { profiles: Profile[] }) {
  const [filter, setFilter] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!filter) return profiles
    const f = filter.toLowerCase()
    return profiles.filter(
      (p) =>
        p.first_name.toLowerCase().includes(f) ||
        p.last_name.toLowerCase().includes(f) ||
        p.email.toLowerCase().includes(f) ||
        (p.current_company?.toLowerCase().includes(f) ?? false)
    )
  }, [profiles, filter])

  const handle = (fn: () => Promise<{ error?: string } | undefined>) => {
    setError(null)
    startTransition(async () => {
      const r = await fn()
      if (r && 'error' in r) setError(r.error ?? null)
    })
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by name, email, or company…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-md"
      />
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">School</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted">
                <td className="px-4 py-3">{p.first_name} {p.last_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={p.approval_status === 'approved' ? 'secondary' : 'outline'}
                    className={
                      p.approval_status === 'approved'
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 hover:bg-green-100 dark:bg-green-500/20'
                        : p.approval_status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-800 hover:bg-red-100 dark:bg-red-500/20'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:bg-amber-500/20'
                    }
                  >
                    {p.approval_status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {p.role === 'admin' ? (
                    <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:bg-amber-500/20">admin</Badge>
                  ) : (
                    <span className="text-muted-foreground">member</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{p.harvard_school}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  {p.role === 'admin' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handle(() => demoteToMember(p.id))}
                      disabled={isPending}
                    >
                      Demote
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handle(() => promoteToAdmin(p.id))}
                      disabled={isPending}
                    >
                      Make admin
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (window.confirm(`Permanently delete ${p.first_name} ${p.last_name}? This cannot be undone.`)) {
                        handle(() => deleteMember(p.id))
                      }
                    }}
                    disabled={isPending}
                    className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:bg-red-500/10"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {profiles.length} members
      </p>
    </div>
  )
}

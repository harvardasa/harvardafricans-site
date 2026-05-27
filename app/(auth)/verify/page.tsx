import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          We sent a magic link to your Harvard email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-gray-600">
        <p>Click the link in the email to sign in. It expires in 1 hour.</p>
        <p>Can&apos;t find it? Check your spam or promotions folder.</p>
        <Link href="/login" className="text-green-700 underline text-sm">
          ← Back to sign in
        </Link>
      </CardContent>
    </Card>
  )
}

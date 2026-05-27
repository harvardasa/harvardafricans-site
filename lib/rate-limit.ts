// Simple in-memory rate limiter. Good enough for v1; swap for Upstash/Redis
// when the app scales horizontally (Vercel will run multiple instances and
// per-instance counters will undercount).

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: limit - 1, resetAt }
  }

  existing.count += 1
  return {
    ok: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  }
}

export function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

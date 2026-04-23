import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, body, userIds, sessionId } = await req.json()

  const query = supabase.from('push_subscriptions').select('*')
  if (userIds?.length) query.in('user_id', userIds)

  const { data: subs } = await query

  const results = await Promise.allSettled(
    (subs || []).map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        JSON.stringify({ title, body, data: { sessionId } })
      )
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length

  return NextResponse.json({ sent, total: subs?.length ?? 0 })
}

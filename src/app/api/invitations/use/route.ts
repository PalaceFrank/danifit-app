import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createAdminClient()
  const { invitationId } = await req.json()

  if (!invitationId) {
    return NextResponse.json({ error: 'Missing invitationId' }, { status: 400 })
  }

  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, status, expires_at')
    .eq('id', invitationId)
    .eq('status', 'pending')
    .single()

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found or already used' }, { status: 404 })
  }

  const inv = invitation as { id: string; status: string; expires_at: string }
  if (new Date(inv.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invitation expired' }, { status: 410 })
  }

  await supabase
    .from('invitations')
    .update({ status: 'used', used_at: new Date().toISOString() })
    .eq('id', invitationId)

  return NextResponse.json({ ok: true })
}

import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InviteForm } from './InviteForm'
import type { Database } from '@/types/database'

type Invitation = Database['public']['Tables']['invitations']['Row']

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = await createAdminClient()

  const { data: rawInvitation } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', params.token)
    .eq('status', 'pending')
    .single()

  const invitation = rawInvitation as Invitation | null

  if (!invitation || new Date(invitation.expires_at) < new Date()) {
    notFound()
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-pink rounded-2xl items-center justify-center mb-2">
            <span className="text-white font-black text-2xl">DF</span>
          </div>
          <h1 className="text-2xl font-bold">¡Te han invitado!</h1>
          <p className="text-text-muted text-sm">
            {invitation.name
              ? `Hola ${invitation.name}, completa tu registro para unirte a Danifit`
              : 'Completa tu registro para unirte a Danifit'}
          </p>
        </div>
        <InviteForm invitationId={invitation.id} defaultName={invitation.name || ''} />
      </div>
    </div>
  )
}

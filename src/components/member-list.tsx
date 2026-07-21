import { Check, Clock } from 'lucide-react'
import { MemberAvatar } from '@/src/components/member-avatar'

export type Member = {
  name: string
  connected: boolean
}

export function MemberList({ members }: { members: Member[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {members.map((member, index) => (
        <li
          key={member.name}
          className="flex items-center gap-3 rounded-2xl bg-secondary/70 p-3"
        >
          <MemberAvatar name={member.name} index={index} className="h-11 w-11 text-sm" />
          <div className="flex-1">
            <p className="font-semibold leading-tight text-foreground">{member.name}</p>
            <p className="text-sm text-muted-foreground">
              {member.connected ? 'Calendar Connected' : 'Waiting to Connect'}
            </p>
          </div>
          {member.connected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9F1E4] px-3 py-1 text-xs font-semibold text-[#5F9E6B]">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Connected
            </span>
            ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBEFD6] px-3 py-1 text-xs font-semibold text-[#E8A24C]">
                <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
                Waiting
            </span>
            )}
        </li>
      ))}
    </ul>
  )
}

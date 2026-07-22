import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { MemberAvatar } from "@/src/components/member-avatar"

type Stage = "finding" | "voting" | "confirmed"

const STAGE_STYLES: Record<
  Stage,
  { label: string; dot: string; badge: string }
> = {
  finding: {
    label: "Finding availability",
    dot: "bg-[#5F9E6B]",
    badge: "bg-[#E9F1E4] text-[#3F6B48]",
  },
  voting: {
    label: "Voting on activities",
    dot: "bg-primary",
    badge: "bg-[#FBE0DA] text-[#B23A28]",
  },
  confirmed: {
    label: "Hangout confirmed",
    dot: "bg-[#4C86E8]",
    badge: "bg-[#DCE7FB] text-[#28518A]",
  },
}

export type Group = {
  id: string
  name: string
  members: number
  memberNames: string[]
  stage: Stage
  message: string
}

export function GroupCard({ group }: { group: Group }) {
  const stage = STAGE_STYLES[group.stage]

  return (
    <Link
      href={`/group-dashboard/${group.id}`}
      className="group flex items-center gap-4 rounded-3xl bg-card p-5 shadow-[0_12px_30px_-18px_rgba(61,43,36,0.45)] ring-1 ring-black/[0.03] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-18px_rgba(61,43,36,0.5)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="font-serif text-xl font-bold text-foreground">
            {group.name}
          </h3>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${stage.badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${stage.dot}`}
              aria-hidden="true"
            />
            {stage.label}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex -space-x-2">
            {group.memberNames.slice(0, 4).map((name, index) => (
              <MemberAvatar
                key={name}
                name={name}
                index={index}
                className="h-7 w-7 text-xs"
              />
            ))}
          </div>

          <span className="text-sm font-medium text-muted-foreground">
            {group.members} members
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {group.message}
        </p>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  )
}
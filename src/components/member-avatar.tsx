import { cn } from '@/lib/utils'

const PALETTE = [
  { bg: '#F6C9A8', fg: '#7a3d1d' },
  { bg: '#E8A24C', fg: '#3d2b24' },
  { bg: '#E8604C', fg: '#ffffff' },
  { bg: '#9FC7A6', fg: '#25412c' },
  { bg: '#D8B4E2', fg: '#3d2b24' },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function MemberAvatar({
  name,
  index = 0,
  className,
}: {
  name: string
  index?: number
  className?: string
}) {
  const color = PALETTE[index % PALETTE.length]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center rounded-full font-semibold ring-2 ring-card',
        className,
      )}
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      {initials(name)}
    </span>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Users, X, Clipboard } from "lucide-react"

const CODE_LENGTH = 6

export function JoinGroupModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card text-base font-bold text-foreground transition-colors hover:bg-accent"
      >
        <Users className="h-5 w-5" aria-hidden="true" />
        Join with Code
      </button>
      {open && <JoinDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function JoinDialog({ onClose }: { onClose: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const setValueAt = useCallback((index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const fillFrom = useCallback(
    (startIndex: number, raw: string) => {
      const chars = raw
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .split("")
      if (chars.length === 0) return
      setDigits((prev) => {
        const next = [...prev]
        let cursor = startIndex
        for (const char of chars) {
          if (cursor >= CODE_LENGTH) break
          next[cursor] = char
          cursor += 1
        }
        const focusIndex = Math.min(cursor, CODE_LENGTH - 1)
        requestAnimationFrame(() => inputsRef.current[focusIndex]?.focus())
        return next
      })
    },
    [],
  )

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      fillFrom(index, value)
      return
    }
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    setValueAt(index, char)
    if (char && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      e.preventDefault()
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    fillFrom(index, e.clipboardData.getData("text"))
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      fillFrom(0, text)
    } catch {
      inputsRef.current[0]?.focus()
    }
  }

  const code = digits.join("")
  const isComplete = code.length === CODE_LENGTH

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) return
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-group-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-card p-7 shadow-[0_30px_70px_-20px_rgba(61,43,36,0.45)] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <h2 id="join-group-title" className="mt-4 text-pretty font-serif text-2xl font-bold text-foreground">
            Join a Group
          </h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            Enter the invite code your friend shared with you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7">
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el
                }}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                maxLength={1}
                value={digit}
                aria-label={`Invite code character ${index + 1}`}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => handlePaste(index, e)}
                className="h-14 w-11 rounded-2xl border-2 border-border bg-secondary/40 text-center font-serif text-2xl font-bold uppercase text-foreground caret-primary outline-none transition-colors focus:border-primary focus:bg-card sm:h-16 sm:w-12"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isComplete}
            className="mt-7 h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[0_12px_26px_-10px_rgba(232,96,76,0.65)] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Join Group
          </button>
        </form>

        <button
          type="button"
          onClick={pasteFromClipboard}
          className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          <Clipboard className="h-4 w-4" aria-hidden="true" />
          Paste from Clipboard
        </button>

        <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
          {"Don't have an invite code? "}
          <span className="font-semibold text-foreground">Ask a friend to share one with you.</span>
        </p>
      </div>
    </div>
  )
}

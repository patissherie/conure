"use client"

import type React from "react"
import { useState } from "react"
import { Users, Info, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"

export function CreateGroupCard() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Hook up group creation here.
    console.log("[v0] Create group submitted:", { name, description })
    window.location.href = "/dashboard"
  }

  return (
    <div className="w-full max-w-lg rounded-[24px] bg-card px-8 py-10 shadow-[0_24px_60px_-20px_rgba(61,43,36,0.35)] sm:px-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground text-balance">Create a New Group</h1>
        <p className="mt-2 text-base text-muted-foreground text-pretty">
          Start planning your next hangout with friends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="groupName" className="text-sm font-semibold text-foreground">
            {"Group Name "}
            <span className="text-primary">*</span>
          </label>
          <input
            id="groupName"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Coffee Lovers"
            className="h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-semibold text-foreground">
            {"Description "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group for?"
            className="w-full resize-none rounded-2xl border border-input bg-muted/40 px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-accent/60 px-3.5 py-3">
          <Info className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">You can invite friends after creating your group.</p>
        </div>

        <Button
          type="submit"
          className="mt-1 h-14 w-full gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[0_10px_24px_-8px_rgba(232,96,76,0.6)] hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </Button>

        <a
          href="/dashboard"
          className="mx-auto text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Cancel
        </a>
      </form>
    </div>
  )
}

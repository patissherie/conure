import { DashboardNav } from "../../../src/components/dashboard-nav"
import { CreateGroupCard } from "../../../src/components/create-group-card"

export default function CreateGroupPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <DashboardNav />
        <main className="flex justify-center px-2 py-10 sm:py-14">
          <CreateGroupCard />
        </main>
      </div>
    </div>
  )
}

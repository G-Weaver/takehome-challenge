import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { getEvents } from "@/lib/actions/events.actions"
import { EventsTable } from "@/components/events-table"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const result = await getEvents()
  const events = result.success ? result.data : []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-black py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-purple-600/10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-6 flex justify-between items-start">
          <Link href="/" className="transition-transform hover:scale-105 inline-block">
            <Image
              src="/logo.jpeg"
              alt="Fastbreak Logo"
              width={192}
              height={48}
              className="h-12 w-auto mix-blend-lighten"
            />
          </Link>
          <div className="flex items-center gap-4 bg-gray-900/60 backdrop-blur-xl rounded-xl px-6 py-3 border border-cyan-400/20">
            {user?.email && (
              <span className="text-cyan-400 font-semibold">{user.email}</span>
            )}
            <LogoutButton />
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/10 via-blue-500/5 to-purple-500/10 blur-xl"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-4xl font-black text-white mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EVENTS DASHBOARD
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
              </div>
              <Link href="/events/create">
                <Button className="h-14 px-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-black font-black text-lg rounded-xl shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 uppercase tracking-wider">
                  Create Event
                </Button>
              </Link>
            </div>

            <EventsTable initialEvents={events || []} currentUserId={user?.id} />
          </div>
        </div>
      </div>
    </main>
  );
}

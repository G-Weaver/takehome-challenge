import Link from "next/link";
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <p> Made it to the front page!!! </p>
          <Link href="/events/create">
              <Button>Create Event</Button>
          </Link>
      </div>
    </main>
  );
}

"use client"

import { useState, useTransition, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getEvents, deleteEvent, getSports } from "@/lib/actions/events.actions"
import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Event {
  id: string
  name: string
  date_time: string
  description: string
  sport_id: string
  venue_ids: string[]
  created_by: string
  created_at: string
  sports: {
    id: string
    name: string
  }
  venues: {
    id: string
    name: string
  }[]
}

interface EventsTableProps {
  initialEvents: Event[]
  currentUserId?: string
}

export function EventsTable({ initialEvents, currentUserId }: EventsTableProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [search, setSearch] = useState("")
  const [sportFilter, setSportFilter] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [sports, setSports] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    async function fetchSports() {
      const result = await getSports()
      if (result.success && result.data) {
        setSports(result.data)
      }
    }
    fetchSports()
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    startTransition(async () => {
      const result = await getEvents({
        search: value || undefined,
        sportType: sportFilter || undefined
      })
      if (result.success) {
        setEvents(result.data || [])
      }
    })
  }

  const handleSportFilter = (value: string) => {
    const newValue = value === "all" ? "" : value
    setSportFilter(newValue)
    startTransition(async () => {
      const result = await getEvents({
        search: search || undefined,
        sportType: newValue || undefined
      })
      if (result.success) {
        setEvents(result.data || [])
      }
    })
  }

  const handleDeleteClick = (id: string) => {
    setEventToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return

    startTransition(async () => {
      const result = await deleteEvent(eventToDelete)
      if (result.success) {
        toast.success("Event deleted successfully")
        // Refresh the events list
        const eventsResult = await getEvents({
          search: search || undefined,
          sportType: sportFilter || undefined
        })
        if (eventsResult.success) {
          setEvents(eventsResult.data || [])
        }
      } else {
        toast.error(result.error || "Failed to delete event")
      }
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search events by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-14 text-lg border-2 border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 bg-gray-800/50 text-white rounded-xl shadow-lg placeholder:text-gray-400 font-semibold transition-all duration-300 hover:border-cyan-500"
          />
        </div>
        <div className="w-64">
          <Select value={sportFilter || "all"} onValueChange={handleSportFilter}>
            <SelectTrigger className="h-14 text-lg border-2 border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 bg-gray-800/50 text-white rounded-xl shadow-lg font-semibold transition-all duration-300 hover:border-cyan-500">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 shadow-2xl rounded-xl max-h-[300px] overflow-y-auto">
              <SelectItem value="all" className="text-lg py-4 text-white hover:bg-cyan-400/20 focus:bg-cyan-400/20 font-medium">All Sports</SelectItem>
              {sports.map((sport) => (
                <SelectItem
                  key={sport.id}
                  value={sport.name}
                  className="text-lg py-4 text-white hover:bg-cyan-400/20 focus:bg-cyan-400/20 font-medium"
                >
                  <span className="capitalize">{sport.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-cyan-400/20 overflow-hidden bg-gray-800/50 backdrop-blur-sm shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-cyan-400/20 hover:bg-cyan-400/5">
              <TableHead className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Event Name</TableHead>
              <TableHead className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Sport Type</TableHead>
              <TableHead className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Date & Time</TableHead>
              <TableHead className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Venues</TableHead>
              <TableHead className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Description</TableHead>
              <TableHead className="text-lg font-bold text-cyan-400 uppercase tracking-wide text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-cyan-400 py-12 text-lg font-semibold">
                  Loading...
                </TableCell>
              </TableRow>
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id} className="border-b border-gray-700 hover:bg-cyan-400/10 transition-colors duration-200">
                  <TableCell className="font-bold text-white text-base">{event.name}</TableCell>
                  <TableCell className="capitalize font-semibold text-blue-300">{event.sports?.name}</TableCell>
                  <TableCell className="text-gray-300 font-medium">
                    {new Date(event.date_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-300 font-medium">
                    {event.venues && event.venues.length > 0
                      ? event.venues.map(v => v.name).join(", ")
                      : "No venues"}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-gray-400 font-medium">{event.description}</TableCell>
                  <TableCell className="text-right">
                    {currentUserId && event.created_by === currentUserId ? (
                      <div className="flex gap-2 justify-end">
                        <Link href={`/events/edit/${event.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(event.id)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-cyan-400 py-12 text-lg font-semibold">
                  No events found. Create your first event!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-2 border-red-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-400">Delete Event</DialogTitle>
            <DialogDescription className="text-gray-300 text-base">
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

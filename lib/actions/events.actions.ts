"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getEvents(params?: {
  search?: string
  sportType?: string
}) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from("events")
      .select(`
        id,
        name,
        date_time,
        description,
        sport_id,
        venue_ids,
        created_by,
        created_at,
        sports (
          id,
          name
        )
      `)
      .order("date_time", { ascending: false })

    if (params?.search) {
      query = query.ilike("name", `%${params.search}%`)
    }

    if (params?.sportType) {
      const { data: sport, error: sportError } = await supabase
        .from("sports")
        .select("id")
        .ilike("name", params.sportType)
        .single()

      if (sport) {
        query = query.eq("sport_id", sport.id)
      }
    }

    const { data: events, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    if (events && events.length > 0) {
      const allVenueIds = events.flatMap(event => event.venue_ids || [])
      const uniqueVenueIds = [...new Set(allVenueIds)]

      if (uniqueVenueIds.length > 0) {
        const { data: venues } = await supabase
          .from("venues")
          .select("id, name")
          .in("id", uniqueVenueIds)

        const venueMap = new Map(venues?.map(v => [v.id, v]) || [])
        events.forEach(event => {
          event.venues = (event.venue_ids || [])
            .map(id => venueMap.get(id))
            .filter(Boolean)
        })
      }
    }

    return { success: true, data: events }
  } catch (error) {
    return { success: false, error: "Failed to fetch events" }
  }
}

export async function createEvent(data: {
  eventName: string
  sportType: string
  dateTime: Date
  description: string
  venues: string[]
}) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "You must be logged in to create an event" }
    }

    let { data: sport, error: sportError } = await supabase
      .from("sports")
      .select("id")
      .eq("name", data.sportType.toLowerCase())
      .single()

    if (sportError && sportError.code !== "PGRST116") {
      return { success: false, error: "Failed to fetch sport" }
    }

    if (!sport) {
      const { data: newSport, error: createSportError } = await supabase
        .from("sports")
        .insert({ name: data.sportType.toLowerCase() })
        .select("id")
        .single()

      if (createSportError) {
        return { success: false, error: `Failed to create sport: ${createSportError.message}` }
      }
      sport = newSport
    }

    const venueIds: string[] = []

    for (const venueName of data.venues) {
      let { data: venue, error: venueError } = await supabase
        .from("venues")
        .select("id")
        .eq("name", venueName)
        .single()

      if (venueError && venueError.code !== "PGRST116") {
        continue
      }

      if (!venue) {
        const { data: newVenue, error: createVenueError } = await supabase
          .from("venues")
          .insert({
            name: venueName,
            address: "Address TBD"
          })
          .select("id")
          .single()

        if (createVenueError) {
          continue
        }
        venue = newVenue
      }

      if (venue) {
        venueIds.push(venue.id)
      }
    }

    if (venueIds.length === 0) {
      return { success: false, error: "At least one valid venue is required" }
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        name: data.eventName,
        sport_id: sport.id,
        venue_ids: venueIds,
        date_time: data.dateTime.toISOString(),
        description: data.description,
        created_by: user.id,
      })
      .select()
      .single()

    if (eventError) {
      return { success: false, error: "Failed to create event" }
    }

    revalidatePath("/")
    return { success: true, data: event }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getEventById(id: string) {
  try {
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from("events")
      .select(`
        id,
        name,
        date_time,
        description,
        sport_id,
        venue_ids,
        created_by,
        sports (
          id,
          name
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (event.venue_ids && event.venue_ids.length > 0) {
      const { data: venues } = await supabase
        .from("venues")
        .select("id, name")
        .in("id", event.venue_ids)

      event.venues = venues || []
    }

    return { success: true, data: event }
  } catch (error) {
    return { success: false, error: "Failed to fetch event" }
  }
}

export async function updateEvent(
  id: string,
  data: {
    eventName: string
    sportType: string
    dateTime: Date
    description: string
    venues: string[]
  }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "You must be logged in to update an event" }
    }

    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", id)
      .single()

    if (fetchError) {
      return { success: false, error: "Event not found" }
    }

    if (existingEvent.created_by !== user.id) {
      return { success: false, error: "You don't have permission to edit this event" }
    }

    let { data: sport, error: sportError } = await supabase
      .from("sports")
      .select("id")
      .eq("name", data.sportType.toLowerCase())
      .single()

    if (sportError && sportError.code !== "PGRST116") {
      return { success: false, error: "Failed to fetch sport" }
    }

    if (!sport) {
      const { data: newSport, error: createSportError } = await supabase
        .from("sports")
        .insert({ name: data.sportType.toLowerCase() })
        .select("id")
        .single()

      if (createSportError) {
        return { success: false, error: `Failed to create sport: ${createSportError.message}` }
      }
      sport = newSport
    }

    const venueIds: string[] = []

    for (const venueName of data.venues) {
      let { data: venue, error: venueError } = await supabase
        .from("venues")
        .select("id")
        .eq("name", venueName)
        .single()

      if (venueError && venueError.code !== "PGRST116") {
        continue
      }

      if (!venue) {
        const { data: newVenue, error: createVenueError } = await supabase
          .from("venues")
          .insert({
            name: venueName,
            address: "Address TBD"
          })
          .select("id")
          .single()

        if (createVenueError) {
          continue
        }
        venue = newVenue
      }

      if (venue) {
        venueIds.push(venue.id)
      }
    }

    if (venueIds.length === 0) {
      return { success: false, error: "At least one valid venue is required" }
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .update({
        name: data.eventName,
        sport_id: sport.id,
        venue_ids: venueIds,
        date_time: data.dateTime.toISOString(),
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (eventError) {
      return { success: false, error: "Failed to update event" }
    }

    revalidatePath("/")
    return { success: true, data: event }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteEvent(id: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "You must be logged in to delete an event" }
    }

    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", id)
      .single()

    if (fetchError) {
      return { success: false, error: "Event not found" }
    }

    if (existingEvent.created_by !== user.id) {
      return { success: false, error: "You don't have permission to delete this event" }
    }

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return { success: false, error: "Failed to delete event" }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getSports() {
  try {
    const supabase = await createClient()

    const { data: sports, error } = await supabase
      .from("sports")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: sports || [] }
  } catch (error) {
    return { success: false, error: "Failed to fetch sports" }
  }
}
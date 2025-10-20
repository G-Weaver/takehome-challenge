"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"


import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { createEvent, getSports } from "@/lib/actions/events.actions"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

const formSchema = z.object({
    eventName: z.string().min(2, "Event name must be at least 2 characters"),
    sportType: z.string().min(1, "Please select a sport type"),
    dateTime: z.date({ message: "Date and time is required" }),
    description: z.string().min(10, "Description must be at least 10 characters"),
    venues: z.string().min(1, "At least one venue is required"),
})

export default function EventForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sports, setSports] = useState<{ id: string; name: string }[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eventName: "",
            sportType: "",
            description: "",
            venues: "",
        },
    })

    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [time, setTime] = React.useState<string>("")

    useEffect(() => {
        async function fetchSports() {
            const result = await getSports()
            if (result.success && result.data) {
                setSports(result.data)
            }
        }
        fetchSports()
    }, [])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        setError(null)

        const venuesArray = values.venues.split(",").map(v => v.trim()).filter(Boolean)

        const result = await createEvent({
            ...values,
            venues: venuesArray
        })

        if (result.success) {
            toast.success("Event created successfully!")
            router.push("/")
        } else {
            const errorMessage = result.error || "Failed to create event"
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-black py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-purple-600/10"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-6">
                    <Link href="/" className="transition-transform hover:scale-105 inline-block">
                        <Image
                            src="/logo.jpeg"
                            alt="Fastbreak Logo"
                            width={192}
                            height={48}
                            className="h-12 w-auto mix-blend-lighten"
                        />
                    </Link>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 relative max-w-2xl mx-auto">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/10 via-blue-500/5 to-purple-500/10 blur-xl"></div>

                    <div className="relative z-10">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black text-white mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                CREATE EVENT
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-4 rounded-full"></div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                                        {error}
                                    </div>
                                )}
                                <FormField
                                    control={form.control}
                                    name="eventName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Event Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter event name"
                                                    {...field}
                                                    className="h-14 text-lg border-2 border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 bg-gray-800/50 text-white rounded-xl shadow-lg placeholder:text-gray-400 font-semibold transition-all duration-300 hover:border-cyan-500"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400 font-medium" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sportType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Sport Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 text-lg border-2 border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 bg-gray-800/50 text-white rounded-xl shadow-lg font-semibold transition-all duration-300 hover:border-cyan-500">
                                                        <SelectValue placeholder="Select a sport" className="text-gray-400" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-800 border-gray-700 shadow-2xl rounded-xl max-h-[300px] overflow-y-auto">
                                                    {sports.map((sport) => (
                                                        <SelectItem
                                                            key={sport.id}
                                                            value={sport.name}
                                                            className="text-lg py-4 text-white hover:bg-cyan-400/20 focus:bg-cyan-400/20 font-medium capitalize"
                                                        >
                                                            {sport.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-red-400 font-medium" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateTime"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Date & Time</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col gap-3 flex-1">
                                                        <Popover open={open} onOpenChange={setOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    id="date-picker"
                                                                    className="h-14 justify-between font-bold text-lg border-2 border-gray-700 hover:border-cyan-400 hover:bg-cyan-400/10 bg-gray-800/50 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
                                                                >
                                                                    {date ? date.toLocaleDateString() : "Select date"}
                                                                    <ChevronDownIcon className="text-cyan-400" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto overflow-hidden p-0 bg-gray-800 border-2 border-cyan-400/30 shadow-2xl rounded-xl" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={date}
                                                                    captionLayout="dropdown"
                                                                    onSelect={(selectedDate) => {
                                                                        setDate(selectedDate)
                                                                        setOpen(false)
                                                                        if (selectedDate && time) {
                                                                            const [hours, minutes] = time.split(":")
                                                                            const combined = new Date(selectedDate)
                                                                            combined.setHours(parseInt(hours), parseInt(minutes))
                                                                            field.onChange(combined)
                                                                        }
                                                                    }}
                                                                    className="bg-gray-800 text-white [&_.rdp-day_selected]:bg-cyan-400 [&_.rdp-day_selected]:text-black [&_.rdp-day]:hover:bg-cyan-400/20 [&_.rdp-day]:text-white [&_.rdp-head_cell]:text-cyan-400 [&_.rdp-caption]:text-white [&_.rdp-nav_button]:text-cyan-400 [&_.rdp-nav_button]:hover:bg-cyan-400/20"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="flex flex-col gap-3 flex-1">
                                                        <Input
                                                            type="time"
                                                            id="time-picker"
                                                            value={time}
                                                            onChange={(e) => {
                                                                setTime(e.target.value)
                                                                if (date && e.target.value) {
                                                                    const [hours, minutes] = e.target.value.split(":")
                                                                    const combined = new Date(date)
                                                                    combined.setHours(parseInt(hours), parseInt(minutes))
                                                                    field.onChange(combined)
                                                                }
                                                            }}
                                                            className="h-14 text-lg border-2 border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 bg-gray-800/50 text-white rounded-xl shadow-lg font-semibold transition-all hover:border-cyan-500 [&::-webkit-datetime-edit]:text-white [&::-webkit-datetime-edit-fields-wrapper]:text-white [&::-webkit-datetime-edit-text]:text-white [&::-webkit-datetime-edit-minute]:text-white [&::-webkit-datetime-edit-hour]:text-white [&::-webkit-datetime-edit-ampm]:text-white"                            />
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400 font-medium" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Event description..."
                                                    {...field}
                                                    className="min-h-[140px] text-lg border-2 border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 bg-gray-800/50 text-white rounded-xl shadow-lg resize-none placeholder:text-gray-400 font-medium transition-all duration-300 hover:border-cyan-500"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400 font-medium" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="venues"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Venues</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter venue names separated by commas"
                                                    {...field}
                                                    className="h-14 text-lg border-2 border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 bg-gray-800/50 text-white rounded-xl shadow-lg placeholder:text-gray-400 font-semibold transition-all duration-300 hover:border-cyan-500"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400 font-medium" />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-black font-black text-xl rounded-xl shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isSubmitting ? "Creating Event..." : "Launch Event"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
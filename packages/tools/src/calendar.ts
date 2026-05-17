export interface CalendarEvent {
    title: string
    time: string
    duration: number
    location?: string
}

export interface CalendarTool {
    name: 'get_calendar_events'
    description: 'Get calendar events for a given date'
    parameters: {
        date: string  // ISO format
    }
}

// Google Calendar via OAuth
export async function getCalendarEvents(
    date: string,
    accessToken: string
): Promise<CalendarEvent[]> {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    const data = await res.json()
    return data.items.map((e: any) => ({
        title: e.summary,
        time: e.start.dateTime || e.start.date,
        duration: 0,
        location: e.location
    }))
}
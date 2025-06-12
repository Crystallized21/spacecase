import {useState} from "react"
import {Calendar, ChevronLeft, ChevronRight} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {TimetableEntry, type TimetableEntryProps} from "./TimetableEntry"
import {addWeeks, differenceInDays, format, isSameWeek, subWeeks} from "date-fns"

interface TimetableCardProps {
  entries: TimetableEntryProps[]
}

export function TimetableCard({entries}: TimetableCardProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)

  // term start dates by year
  const termStartDatesByYear: Record<number, Date[]> = {
    2024: [
      new Date(2024, 0, 29),
      new Date(2024, 3, 29),
      new Date(2024, 6, 22),
      new Date(2024, 9, 14),
    ],
    2025: [
      new Date(2025, 0, 27),
      new Date(2025, 3, 28),
      new Date(2025, 6, 21),
      new Date(2025, 9, 13),
    ],
  }

  const termWeeks = [11, 9, 10, 10]

  // calculate term and week based on date & year
  const calculateTermAndWeek = (date: Date) => {
    const year = date.getFullYear()
    const termStartDates = termStartDatesByYear[year]

    if (!termStartDates) {
      // if no data for year, fallback to default
      return {term: "N/A", weekInTerm: "?"}
    }

    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    console.log("🕒 Target Date:", targetDate.toDateString())

    for (let i = 0; i < termStartDates.length; i++) {
      const termStart = termStartDates[i]
      const termEnd =
        i < termStartDates.length - 1
          ? termStartDates[i + 1]
          : addWeeks(termStart, termWeeks[i])

      console.log(`📚 Checking Term ${i + 1}: ${termStart.toDateString()} → ${termEnd.toDateString()}`)

      if (targetDate >= termStart && targetDate < termEnd) {
        const daysSinceTermStart = differenceInDays(targetDate, termStart)
        const weekInTerm = Math.floor(daysSinceTermStart / 7) + 1
        console.log(`✅ Match: Term ${i + 1}, Week ${weekInTerm}`)
        return {term: i + 1, weekInTerm}
      }
    }

    console.log("❌ Date does not fall within any defined term range.")
    // fallback if before first term start
    if (targetDate < termStartDates[0]) {
      return {term: 1, weekInTerm: 1}
    }
    // fallback if after last term end
    return {term: 4, weekInTerm: termWeeks[3]}
  }

  const {term, weekInTerm} = calculateTermAndWeek(currentDate)

  const goToPreviousWeek = () => setCurrentDate((prev) => subWeeks(prev, 1))
  const goToNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1))
  const goToToday = () => setCurrentDate(today)

  const isCurrentWeek = isSameWeek(currentDate, today)
  const formattedDate = format(currentDate, "EEEE do MMMM")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Timetable</h1>
            <p className="text-m text-gray-600 mt-1">
              {isCurrentWeek
                ? `${formattedDate} → Term ${term}, Week ${weekInTerm}`
                : `Term ${term}, Week ${weekInTerm}`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="lg"
              className="flex items-center space-x-1 cursor-pointer"
              onClick={goToPreviousWeek}
            >
              <ChevronLeft className="h-5 w-5"/>
              <span>Previous Week</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 cursor-pointer"
              onClick={goToToday}
            >
              <Calendar className="h-4 w-4 mr-1"/>
              <span>Today</span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="flex items-center space-x-1 cursor-pointer"
              onClick={goToNextWeek}
            >
              <span>Next Week</span>
              <ChevronRight className="h-5 w-5"/>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <TimetableEntry key={entry.id} entry={entry}/>
        ))}
      </CardContent>
    </Card>
  )
}

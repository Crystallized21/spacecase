import {useState} from "react"
import {Calendar, ChevronLeft, ChevronRight} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {TimetableEntry, type TimetableEntryProps} from "./TimetableEntry"
import {addWeeks, format, isSameWeek, subWeeks} from "date-fns"
import { calculateTermAndWeek } from "@/lib/dateUtils"

interface TimetableCardProps {
  entries: TimetableEntryProps[]
}

export function TimetableCard({entries}: TimetableCardProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)

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

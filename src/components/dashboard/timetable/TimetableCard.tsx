import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimetableEntry, type TimetableEntryProps } from "./TimetableEntry"

interface TimetableCardProps {
  entries: TimetableEntryProps[]
}

export function TimetableCard({ entries }: TimetableCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Timetable</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Wednesday 26th February → Week 4</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="lg" className="flex items-center space-x-1">
              <ChevronLeft className="h-5 w-5" />
              <span>Previous Week</span>
            </Button>
            <Button variant="ghost" size="lg" className="flex items-center space-x-1">
              <span>Next Week</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <TimetableEntry key={entry.id} entry={entry} />
        ))}
      </CardContent>
    </Card>
  )
}

import { AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function NoticesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Notices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Alert</p>
            <AlertDescription className="text-red-700 text-sm mt-1">
              You have not booked a space for your MAT3 class for Period X on March 21st.
            </AlertDescription>
          </div>
        </Alert>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">Notice</p>
            <AlertDescription className="text-blue-700 text-sm mt-1">
              At Period X on March 21st, Pungawerewere Pods will be required for a PHY2 internal.
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  )
}

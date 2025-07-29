import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {format} from "date-fns";
import {formatTime} from "@/lib/utils";
import {calculateTermAndWeek} from "@/lib/dateUtils";
import {useUser} from "@clerk/nextjs";

interface BookingDetailsDialogProps {
  booking: {
    id: string;
    teacherName: string;
    teacherEmail: string;
    date: string;
    time: string;
    notes?: string;
    room?: string;
    commons?: string;
    subject?: string;
    subjectCode?: string;
    createdAt?: string;
  } | null;
  slot?: { number: number; startTime: string; endTime: string };
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsDialog({
  booking,
  slot,
  isOpen,
  onClose
}: BookingDetailsDialogProps) {
  const {user} = useUser();

  if (!booking) return null;

  const bookingDate = new Date(booking.date);
  const formattedDate = format(bookingDate, "EEEE, MMMM d, yyyy");

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Teacher:</span>
            <div className="col-span-3">
              <div className="font-medium">{booking.teacherName}</div>
              <div className="text-sm text-gray-500">{booking.teacherEmail}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Subject:</span>
            <div className="col-span-3">
              <div className="font-medium">{booking.subject}</div>
              <div className="text-sm text-gray-500">{booking.subjectCode}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Location:</span>
            <div className="col-span-3">
              <div className="font-medium">{booking.room}</div>
              <div className="text-sm text-gray-500">{booking.commons} Kainga</div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Date:</span>
            <div className="col-span-3">
              {formattedDate}
              {(() => {
                const {term, weekInTerm} = calculateTermAndWeek(bookingDate);
                return <div className="text-sm text-gray-500">Week {weekInTerm}, Term {term}</div>;
              })()}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Time:</span>
            <div className="col-span-3">
              {slot
                ? `Slot ${slot.number} (${formatTime(slot.startTime)}–${formatTime(slot.endTime)})`
                : `Slot ${booking.time}`}
            </div>
          </div>

          {booking.notes && (
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="text-sm font-medium col-span-1">Notes:</span>
              <div className="col-span-3 text-sm">{booking.notes}</div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Created:</span>
            <div className="col-span-3">
              {booking.createdAt ? (
                <>
                  <div>{format(new Date(booking.createdAt), "dd MMM, yyyy h:mm a")}</div>
                  <div className="text-sm text-gray-500">
                    by {user?.fullName || "Unknown user"}
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Unknown</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
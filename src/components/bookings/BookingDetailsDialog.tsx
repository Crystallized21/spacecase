import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Skeleton} from "@/components/ui/skeleton";
import {calculateTermAndWeek} from "@/lib/dateUtils";
import {formatTime} from "@/lib/utils";
import {format} from "date-fns";
import {BookOpen, Calendar, Clock, FileText, MapPin, User} from "lucide-react";
import {useEffect, useState} from "react";

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  email: string;
}

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
    user_id?: string;
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
  const [teacherDetails, setTeacherDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking?.user_id && isOpen) {
      setTeacherDetails(null); // Reset details
      setLoading(true);
      fetch(`/api/users/${booking.user_id}`)
        .then(res => res.json())
        .then(data => {
          setTeacherDetails(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setTeacherDetails(null); // Reset when closed or no booking
      setLoading(false);
    }
  }, [booking, isOpen]);
  if (!booking) return null;

  const bookingDate = new Date(booking.date);
  const formattedDate = format(bookingDate, "EEEE, MMMM d, yyyy");
  const {term, weekInTerm} = calculateTermAndWeek(bookingDate);

  // get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const teacherInitials = getInitials(booking.teacherName);

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-2xl bg-background p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <DialogTitle className="text-2xl font-bold">Booking Details</DialogTitle>
          <p className="text-primary-foreground/80 mt-1">
            ID: {booking.id}
          </p>
        </DialogHeader>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
              {loading ? (
                <Skeleton className="h-24 w-24 rounded-full"/>
              ) : (
                <Avatar className="h-24 w-24 border-primary shadow-lg">
                  {!loading && teacherDetails?.imageUrl ? (
                    <AvatarImage src={teacherDetails.imageUrl} alt={booking.teacherName} />
                  ) : null}
                  <AvatarFallback className="text-xl bg-primary/10">{teacherInitials}</AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold">
                    {teacherDetails ? `${teacherDetails.firstName} ${teacherDetails.lastName}` : booking.teacherName}
                  </h3>
                  <p className="text-muted-foreground">{booking.teacherEmail}</p>
                </>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-3 py-1">
                  {booking.subject}
                </Badge>
                {booking.subjectCode && (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 px-3 py-1">
                    {booking.subjectCode}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="p-4 shadow-sm border-l-4 border-l-blue-500">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0"/>
                <div>
                  <h4 className="font-semibold">Location</h4>
                  <p className="font-medium">{booking.room}</p>
                  <p className="text-sm text-gray-500">{booking.commons} Kainga</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0"/>
                <div>
                  <h4 className="font-semibold">Date</h4>
                  <p className="font-medium">{formattedDate}</p>
                  <p className="text-sm text-gray-500">Week {weekInTerm}, Term {term}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-sm border-l-4 border-l-purple-500">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-purple-500 flex-shrink-0"/>
                <div>
                  <h4 className="font-semibold">Time</h4>
                  <p className="font-medium">
                    {slot
                      ? `Slot ${slot.number} (${formatTime(slot.startTime)}–${formatTime(slot.endTime)})`
                      : `Slot ${booking.time}`}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-sm border-l-4 border-l-green-500">
              <div className="flex gap-3">
                <BookOpen className="h-5 w-5 text-green-500 flex-shrink-0"/>
                <div>
                  <h4 className="font-semibold">Subject</h4>
                  <p className="font-medium">{booking.subject}</p>
                  <p className="text-sm text-gray-500">{booking.subjectCode}</p>
                </div>
              </div>
            </Card>
          </div>

          {booking.notes && (
            <Card className="p-4 mt-6 shadow-sm border-l-4 border-l-gray-400">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5"/>
                <div>
                  <h4 className="font-semibold">Notes</h4>
                  <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-6 pt-6 border-t border-dashed">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400"/>
              <div>
                <h4 className="text-sm text-gray-500">Created</h4>
                {booking.createdAt ? (
                  <div className="flex flex-wrap items-center gap-x-2">
                    <p className="text-sm font-medium">
                      {format(new Date(booking.createdAt), "dd MMM, yyyy h:mm a")}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {booking?.teacherName || "Unknown user"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Unknown</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "react-calendar/dist/Calendar.css";
import { useTheme } from "next-themes";

interface MovieSchedule {
  id: string;
  date: string;
  movie: {
    id: string;
    title: string;
    posterUrl: string;
    description: string;
  };
}

interface CalendarProps {
  isAdmin?: boolean;
}

export default function MovieCalendar({ isAdmin = false }: CalendarProps) {
  const [schedules, setSchedules] = useState<MovieSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/admin/schedule');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const getScheduleForDate = (date: Date) => {
    // Format date as YYYY-MM-DD in local timezone
    const dateString = date.getFullYear() + '-' + 
                      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(date.getDate()).padStart(2, '0');
    
    return schedules.find(schedule => {
      // Format schedule date as YYYY-MM-DD in local timezone
      const scheduleDate = new Date(schedule.date);
      const scheduleDateString = scheduleDate.getFullYear() + '-' + 
                                String(scheduleDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(scheduleDate.getDate()).padStart(2, '0');
      
      return scheduleDateString === dateString;
    });
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const schedule = getScheduleForDate(date);
      if (schedule) {
        return (
          <div className="flex flex-col items-center mt-1">
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {schedule.movie.title.length > 10 
                ? schedule.movie.title.substring(0, 10) + '...' 
                : schedule.movie.title}
            </Badge>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const schedule = getScheduleForDate(date);
      if (schedule) {
        return 'movie-scheduled';
      }
    }
    return '';
  };

  const selectedSchedule = selectedDate ? getScheduleForDate(selectedDate) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Movie Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="movie-calendar">
            <style jsx global>{`
              .movie-calendar .react-calendar {
                width: 100%;
                border: none;
                font-family: inherit;
                background: transparent;
              }
              .movie-calendar .react-calendar__tile {
                min-height: 60px;
                position: relative;
                padding: 4px;
                border: 1px solid hsl(var(--border));
                background: hsl(var(--background));
              }
              .movie-calendar .react-calendar__tile.movie-scheduled {
                background-color: hsl(var(--primary) / 0.1);
                border-color: hsl(var(--primary));
              }
              .movie-calendar .react-calendar__tile.movie-scheduled:hover {
                background-color: hsl(var(--primary) / 0.2);
              }
              .movie-calendar .react-calendar__tile--active {
                background-color: hsl(var(--primary)) !important;
                color: hsl(var(--primary-foreground)) !important;
              }
              .movie-calendar .react-calendar__tile:hover {
                background-color: hsl(var(--accent));
              }
              .movie-calendar .react-calendar__navigation {
                margin-bottom: 1rem;
              }
              .movie-calendar .react-calendar__navigation button {
                color: hsl(var(--foreground));
                font-size: 16px;
                font-weight: 500;
                background: hsl(var(--background));
                border: 1px solid hsl(var(--border));
                border-radius: 0.375rem;
                padding: 0.5rem 1rem;
              }
              .movie-calendar .react-calendar__navigation button:hover {
                background-color: hsl(var(--accent));
              }
              .movie-calendar .react-calendar__month-view__weekdays {
                text-align: center;
                font-weight: 600;
                color: hsl(var(--foreground));
              }
              
              /* Dark mode overrides */
              .dark .movie-calendar .react-calendar__tile {
                border: 1px solid hsl(var(--border));
                background: hsl(var(--background));
              }
              .dark .movie-calendar .react-calendar__tile.movie-scheduled {
                background-color: hsl(var(--primary) / 0.15);
                border-color: hsl(var(--primary));
              }
              .dark .movie-calendar .react-calendar__tile.movie-scheduled:hover {
                background-color: hsl(var(--primary) / 0.25);
              }
              .dark .movie-calendar .react-calendar__navigation button {
                color: hsl(var(--foreground));
                background: hsl(var(--background));
                border: 1px solid hsl(var(--border));
              }
              .dark .movie-calendar .react-calendar__navigation button:hover {
                background-color: hsl(var(--accent));
              }
              .dark .movie-calendar .react-calendar__month-view__weekdays {
                color: hsl(var(--foreground));
              }
            `}</style>
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
              locale="en-GB"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="lg:w-80">
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSchedule ? (
              <div className="space-y-4">
                <img
                  src={selectedSchedule.movie.posterUrl}
                  alt={selectedSchedule.movie.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedSchedule.movie.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedSchedule.movie.description}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No movie scheduled for this date.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

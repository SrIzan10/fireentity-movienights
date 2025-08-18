"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "react-calendar/dist/Calendar.css";

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
    const dateString = date.toISOString().split('T')[0];
    return schedules.find(schedule => 
      schedule.date.split('T')[0] === dateString
    );
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
                border: 1px solid #e5e7eb;
                background: white;
              }
              .movie-calendar .react-calendar__tile.movie-scheduled {
                background-color: #dbeafe;
                border-color: #3b82f6;
              }
              .movie-calendar .react-calendar__tile.movie-scheduled:hover {
                background-color: #bfdbfe;
              }
              .movie-calendar .react-calendar__tile--active {
                background-color: #3b82f6 !important;
                color: white !important;
              }
              .movie-calendar .react-calendar__tile:hover {
                background-color: #f9fafb;
              }
              .movie-calendar .react-calendar__navigation {
                margin-bottom: 1rem;
              }
              .movie-calendar .react-calendar__navigation button {
                color: #374151;
                font-size: 16px;
                font-weight: 500;
                background: white;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                padding: 0.5rem 1rem;
              }
              .movie-calendar .react-calendar__navigation button:hover {
                background-color: #f3f4f6;
              }
              .movie-calendar .react-calendar__month-view__weekdays {
                text-align: center;
                font-weight: 600;
                color: #374151;
              }
            `}</style>
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
              locale="en-US"
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
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedSchedule.movie.description}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No movie scheduled for this date.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

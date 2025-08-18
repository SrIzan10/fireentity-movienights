// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth";
import { useRouter } from "next/navigation";
import MovieCalendar from "@/components/MovieCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";

interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  suggestedBy: string;
  approved?: boolean;
  votes?: any[];
  userVote?: boolean;
  isOwnSubmission?: boolean;
}

interface MovieSchedule {
  id: string;
  date: string;
  movie: Movie;
}

export default function AdminPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [unapprovedMovies, setUnapprovedMovies] = useState<Movie[]>([]);
  const [approvedMovies, setApprovedMovies] = useState<Movie[]>([]);
  const [schedules, setSchedules] = useState<MovieSchedule[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [votingMovieId, setVotingMovieId] = useState<string | null>(null);

  const fetchUnapprovedMovies = async () => {
    try {
      const res = await fetch("/api/admin/movies");
      if (res.ok) {
        const data = await res.json();
        setUnapprovedMovies(data);
      }
    } catch (error) {
      console.error("Error fetching unapproved movies:", error);
    }
  };

  const fetchApprovedMovies = async () => {
    try {
      const res = await fetch("/api/movies?approved=true");
      if (res.ok) {
        const data = await res.json();
        setApprovedMovies(data);
      }
    } catch (error) {
      console.error("Error fetching approved movies:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/admin/schedule");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    // @ts-ignore
    if (session && !session.user?.isAdmin) {
      router.push("/");
    } else if (session) {
      fetchUnapprovedMovies();
      fetchApprovedMovies();
      fetchSchedules();
    }
  }, [session, router]);

  const handleApprove = async (movieId: string) => {
    try {
      const res = await fetch(`/api/admin/movies/${movieId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        fetchUnapprovedMovies();
        fetchApprovedMovies();
        toast.success("Movie approved successfully!");
      } else {
        toast.error("Failed to approve movie");
      }
    } catch (error) {
      console.error("Error approving movie:", error);
      toast.error("Error approving movie");
    }
  };

  const handleScheduleMovie = async () => {
    if (!selectedMovie || !selectedDate) return;

    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: selectedMovie,
          date: selectedDate,
        }),
      });

      if (res.ok) {
        fetchSchedules();
        setSelectedMovie("");
        setSelectedDate("");
        setIsScheduleDialogOpen(false);
        toast.success("Movie scheduled successfully!");
      } else {
        toast.error("Failed to schedule movie");
      }
    } catch (error) {
      console.error("Error scheduling movie:", error);
      toast.error("Error scheduling movie");
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/admin/schedule?id=${scheduleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSchedules();
        toast.success("Schedule removed successfully!");
      } else {
        toast.error("Failed to remove schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Error removing schedule");
    }
  };

  const handleVote = async (movieId: string) => {
    if (!session) return;

    setVotingMovieId(movieId);

    try {
      const response = await fetch(`/api/movies/${movieId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh movies to show updated vote count
        fetchUnapprovedMovies();
        toast.success("Vote recorded successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setVotingMovieId(null);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          Back to Home
        </Button>
      </div>

      {/* Movie Approval Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Movie Approvals</h2>
        {unapprovedMovies.length === 0 ? (
          <p className="text-gray-500">No movies pending approval</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Suggested By</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unapprovedMovies.map((movie) => (
                <TableRow key={movie.id}>
                  <TableCell className="font-medium">{movie.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{movie.description}</TableCell>
                  <TableCell>{movie.suggestedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{movie.votes?.length || 0} votes</span>
                      <Button 
                        size="sm"
                        onClick={() => handleVote(movie.id)}
                        disabled={votingMovieId === movie.id || movie.userVote || movie.isOwnSubmission}
                        variant={movie.userVote ? "secondary" : "default"}
                      >
                        {movie.isOwnSubmission 
                          ? "Own Submission" 
                          : movie.userVote 
                            ? "Voted" 
                            : votingMovieId === movie.id 
                              ? "Voting..." 
                              : "Vote"}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleApprove(movie.id)}>
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Movie Scheduling Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Movie Schedule</h2>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button>Schedule Movie</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a Movie</DialogTitle>
                <DialogDescription>
                  Select a movie and date to schedule it for movie night.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="movie-select">Movie</Label>
                  <select
                    id="movie-select"
                    className="w-full p-2 border rounded-md"
                    value={selectedMovie}
                    onChange={(e) => setSelectedMovie(e.target.value)}
                  >
                    <option value="">Select a movie</option>
                    {approvedMovies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="date-input">Date</Label>
                  <Input
                    id="date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleScheduleMovie}
                  disabled={!selectedMovie || !selectedDate}
                  className="w-full"
                >
                  Schedule Movie
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <MovieCalendar isAdmin={true} />
      </div>

      {/* Scheduled Movies List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Scheduled Movies</h3>
        {schedules.length === 0 ? (
          <p className="text-gray-500">No movies scheduled</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    {new Date(schedule.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{schedule.movie.title}</TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

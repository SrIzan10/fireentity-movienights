"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth";
import MovieCalendar from "@/components/MovieCalendar";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { ThemeSwitch } from "@/components/theme-switch";

interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  votes: any[];
  userVote?: boolean;
  isOwnSubmission?: boolean;
}

export default function Home() {
  const { data: session } = authClient.useSession();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingMovieId, setVotingMovieId] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
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
        fetchMovies();
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

  if (session) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Toaster position="top-right" />
        <div className="flex justify-between items-center mb-4">
          <p>Signed in as {session.user?.name}</p>
          <div>
            {/* @ts-ignore */}
            {session.user?.isAdmin && (
              <Link href="/admin" passHref>
                <Button variant="outline" className="mr-2">
                  Admin
                </Button>
              </Link>
            )}
            <Link href="/suggest" passHref>
              <Button variant="outline" className="mr-2">
                Suggest a Movie
              </Button>
            </Link>
            <ThemeSwitch />
            <Button onClick={() => authClient.signOut()}>Sign out</Button>
          </div>
        </div>

        {/* Movie Calendar */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Movie Calendar</h2>
          <MovieCalendar />
        </div>

        {/* Movie Voting Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Vote for Movies</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="loading-pulse">
                  <CardHeader className="p-0">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No movies available for voting yet.</p>
              <p className="text-gray-400">Suggest a movie to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <Card key={movie.id} className="movie-card">
                  <CardHeader className="p-0">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="rounded-t-lg w-full h-48 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="mb-2">{movie.title}</CardTitle>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">{movie.description}</p>
                    <div className="flex justify-between items-center">
                      <Button 
                        onClick={() => handleVote(movie.id)}
                        disabled={votingMovieId === movie.id || movie.userVote || movie.isOwnSubmission}
                        className="transition-colors"
                        variant={movie.userVote ? "secondary" : "default"}
                      >
                        {movie.isOwnSubmission 
                          ? "Your Submission" 
                          : movie.userVote 
                            ? "Already Voted" 
                            : votingMovieId === movie.id 
                              ? "Voting..." 
                              : "Vote"}
                      </Button>
                      <span className="text-sm font-medium text-gray-600">
                        {movie.votes.length} {movie.votes.length === 1 ? 'Vote' : 'Votes'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p>Not signed in</p>
      <Button onClick={() => authClient.signIn.social({ provider: "slack" })}>Sign in with Slack</Button>
    </div>
  );
}

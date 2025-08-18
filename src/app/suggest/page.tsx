// src/app/suggest/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
}

export default function SuggestPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length > 2) {
      const res = await fetch(`/api/movies/search?query=${searchQuery}`);
      const data = await res.json();
      setMovies(data);
    } else {
      setMovies([]);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleSubmit = async () => {
    if (!session || !selectedMovie) {
      return;
    }

    const res = await fetch("/api/movies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: selectedMovie.title,
        description: selectedMovie.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`,
        suggestedBy: session.user?.name,
      }),
    });

    if (res.ok) {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Suggest a Movie</CardTitle>
        </CardHeader>
        <CardContent>
          <Command>
            <CommandInput
              placeholder="Search for a movie..."
              value={query}
              onValueChange={handleSearch}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {movies.map((movie) => (
                  <CommandItem
                    key={movie.id}
                    onSelect={() => handleSelectMovie(movie)}
                  >
                    {movie.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {selectedMovie && (
            <div className="mt-4">
              <p>Selected: {selectedMovie.title}</p>
              <Button onClick={handleSubmit} className="mt-2">
                Submit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
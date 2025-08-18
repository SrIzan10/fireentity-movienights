// src/app/api/movies/search/route.ts
import auth from "@/lib/auth-config";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { searchMovieSchema, validateSearchParams } from "@/lib/validation";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate search params
  const { data, error } = validateSearchParams(req.url, searchMovieSchema);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  
  const { query } = data;

  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`
  );
  const apiData = await res.json();

  return NextResponse.json(apiData.results);
}

// src/app/api/movies/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../auth/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { title, description, posterUrl, suggestedBy } = await req.json();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if there's already a pending request for this movie (not approved)
  const existingPendingMovies = await prisma.movie.findMany({
    where: {
      title: {
        equals: title,
        mode: "insensitive"
      },
      approved: false
    }
  });

  // If there's already a pending request, don't allow duplicate
  if (existingPendingMovies.length > 0) {
    return NextResponse.json(
      { error: "This movie has already been suggested and is pending approval." },
      { status: 400 }
    );
  }

  // Check if there are already approved movies with the same title
  const existingApprovedMovies = await prisma.movie.findMany({
    where: {
      title: {
        equals: title,
        mode: "insensitive"
      },
      approved: true
    }
  });

  // If there are existing approved movies, append a number to the title
  let finalTitle = title;
  if (existingApprovedMovies.length > 0) {
    finalTitle = `${title} (${existingApprovedMovies.length + 1})`;
  }

  const movie = await prisma.movie.create({
    data: {
      title: finalTitle,
      description,
      posterUrl,
      suggestedBy,
    },
  });

  return NextResponse.json(movie);
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const approved = !!req.nextUrl.searchParams.get("approved");
  
  // Get all approved movies with votes
  const movies = await prisma.movie.findMany({
    where: {
      approved,
    },
    include: {
      votes: true,
    },
  });
  
  // If user is logged in, add vote information
  if (session && session.user?.id) {
    const userId = session.user.id;
    
    // Add userVote and isOwnSubmission properties to each movie
    const moviesWithUserData = movies.map(movie => ({
      ...movie,
      userVote: movie.votes.some(vote => vote.userId === userId),
      isOwnSubmission: movie.suggestedBy === session.user?.name
    }));
    
    return NextResponse.json(moviesWithUserData);
  }
  
  // For non-logged-in users, just return movies with false values
  const moviesWithoutUserData = movies.map(movie => ({
    ...movie,
    userVote: false,
    isOwnSubmission: false
  }));
  
  return NextResponse.json(moviesWithoutUserData);
}
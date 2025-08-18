// src/app/api/movies/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../auth/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { title, description, posterUrl, suggestedBy } = await req.json();

  const movie = await prisma.movie.create({
    data: {
      title,
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
// src/app/api/admin/movies/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../auth/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const movies = await prisma.movie.findMany({
    where: {
      approved: false,
    },
    include: {
      votes: true,
    },
  });
  
  // Add user vote information
  if (session && session.user?.id) {
    const userId = session.user.id;
    
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

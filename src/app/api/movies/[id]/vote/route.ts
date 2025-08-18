// src/app/api/movies/[id]/vote/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "../../../auth/auth";
import { headers } from "next/headers";
import { idSchema, validateParams } from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate params
  const { data, error } = validateParams(await params, idSchema);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  
  const movieId = data.id;
  const userId = session.user.id;

  // Check if the user has already voted for this movie
  const existingVote = await prisma.vote.findUnique({
    where: {
      movieId_userId: {
        movieId,
        userId,
      },
    },
  });

  if (existingVote) {
    return NextResponse.json(
      { error: "You have already voted for this movie" },
      { status: 400 }
    );
  }

  const vote = await prisma.vote.create({
    data: {
      movieId,
      userId,
    },
  });

  return NextResponse.json(vote);
}
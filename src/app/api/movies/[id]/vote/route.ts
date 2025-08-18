// src/app/api/movies/[id]/vote/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "../../../auth/auth";
import { headers } from "next/headers";
import { idSchema, validateParams } from "@/lib/validation";
import { authClient } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authClient.getSession({ fetchOptions: { headers: await headers() } });

  if (!session || !session.data?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate params
  const { data, error } = validateParams(await params, idSchema);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  
  const movieId = data.id;
  const userId = session.data.user.id;

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
    // If the user has already voted, remove the vote
    await prisma.vote.delete({
      where: {
        id: existingVote.id,
      },
    });

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    await fetch(process.env.SLACK_WEBHOOK!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `User <@${session.data.user.id}> removed their vote for ${movie!.title}`,
      }),
    });

    return NextResponse.json({ message: "Vote removed successfully" });
  } else {
    // If the user has not voted, add the vote
    const vote = await prisma.vote.create({
      data: {
        movieId,
        userId,
      },
    });

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: { votes: true },
    });

    await fetch(process.env.SLACK_WEBHOOK!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `User <@${session.data.user.id}> just voted for ${movie!.title}!`,
        }),
      });
    return NextResponse.json(vote);
  }
}
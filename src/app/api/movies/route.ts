// src/app/api/movies/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

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

export async function GET() {
  const movies = await prisma.movie.findMany({
    where: {
      approved: true,
    },
    include: {
      votes: true,
    },
  });
  return NextResponse.json(movies);
}
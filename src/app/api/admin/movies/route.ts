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
  });

  return NextResponse.json(movies);
}

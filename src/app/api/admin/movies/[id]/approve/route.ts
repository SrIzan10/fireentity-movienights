// src/app/api/admin/movies/[id]/approve/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth/auth";
import { headers } from "next/headers";
import { idSchema, validateParams } from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate params
  const { data, error } = validateParams(await params, idSchema);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const movie = await prisma.movie.update({
    where: {
      id: data.id,
    },
    data: {
      approved: true,
    },
  });

  return NextResponse.json(movie);
}

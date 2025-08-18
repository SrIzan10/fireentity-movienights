// src/app/api/admin/schedule/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../auth/auth";
import { scheduleMovieSchema, scheduleIdSchema, validateRequestData, validateSearchParams } from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate request data
  const { data, error } = await validateRequestData(req, scheduleMovieSchema);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  
  const { movieId, date } = data;

  try {
    const schedule = await prisma.movieSchedule.create({
      data: {
        movieId,
        date: new Date(date),
      },
      include: {
        movie: true,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error scheduling movie:", error);
    return NextResponse.json({ error: "Failed to schedule movie" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const schedules = await prisma.movieSchedule.findMany({
      include: {
        movie: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate search params
  const { data, error } = validateSearchParams(req.url, scheduleIdSchema);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  
  const { id: scheduleId } = data;

  try {
    await prisma.movieSchedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}

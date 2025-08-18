// src/app/api/admin/schedule/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../auth/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId, date } = await req.json();

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

  const { searchParams } = new URL(req.url);
  const scheduleId = searchParams.get('id');

  if (!scheduleId) {
    return NextResponse.json({ error: "Schedule ID required" }, { status: 400 });
  }

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

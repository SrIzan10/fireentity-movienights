-- CreateTable
CREATE TABLE "public"."MovieSchedule" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieSchedule_date_key" ON "public"."MovieSchedule"("date");

-- AddForeignKey
ALTER TABLE "public"."MovieSchedule" ADD CONSTRAINT "MovieSchedule_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

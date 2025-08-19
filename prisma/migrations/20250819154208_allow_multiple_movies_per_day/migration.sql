/*
  Warnings:

  - A unique constraint covering the columns `[movieId,date]` on the table `MovieSchedule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."MovieSchedule_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "MovieSchedule_movieId_date_key" ON "public"."MovieSchedule"("movieId", "date");

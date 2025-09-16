-- CreateTable
CREATE TABLE "public"."Record" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLon" DOUBLE PRECISION NOT NULL,
    "alerts" INTEGER[],
    "status" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

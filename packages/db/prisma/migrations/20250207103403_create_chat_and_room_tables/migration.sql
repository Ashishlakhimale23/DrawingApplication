/*
  Warnings:

  - You are about to drop the column `userId` on the `Room` table. All the data in the column will be lost.
  - Added the required column `adminId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_userId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "userId",
ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "adminId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Chats" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

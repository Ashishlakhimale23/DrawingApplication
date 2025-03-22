-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_roomId_fkey";

-- AlterTable
ALTER TABLE "Chats" ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

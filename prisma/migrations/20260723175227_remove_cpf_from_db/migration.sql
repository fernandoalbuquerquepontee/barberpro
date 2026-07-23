/*
  Warnings:

  - You are about to drop the column `cpf` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_cpf_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "cpf",
DROP COLUMN "imageUrl";

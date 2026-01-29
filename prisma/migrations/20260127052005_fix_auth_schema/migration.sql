DROP INDEX "accounts_provider_providerAccountId_key";

ALTER TABLE "accounts" DROP COLUMN "provider",
DROP COLUMN "providerAccountId",
DROP COLUMN "type",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "providerId" TEXT NOT NULL;

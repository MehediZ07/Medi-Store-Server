
CREATE TYPE "MedicineStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');

CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'SELLER', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

ALTER TABLE "_CategoryToTutorProfile" DROP CONSTRAINT "_CategoryToTutorProfile_A_fkey";

ALTER TABLE "_CategoryToTutorProfile" DROP CONSTRAINT "_CategoryToTutorProfile_B_fkey";

ALTER TABLE "bookings" DROP CONSTRAINT "bookings_studentId_fkey";

ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tutorProfileId_fkey";

ALTER TABLE "reviews" DROP CONSTRAINT "reviews_studentId_fkey";

ALTER TABLE "reviews" DROP CONSTRAINT "reviews_tutorProfileId_fkey";

ALTER TABLE "tutor_profiles" DROP CONSTRAINT "tutor_profiles_userId_fkey";

DROP INDEX "reviews_studentId_tutorProfileId_key";

ALTER TABLE "reviews" DROP COLUMN "studentId",
DROP COLUMN "tutorProfileId",
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "medicineId" TEXT NOT NULL;

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

DROP TABLE "_CategoryToTutorProfile";

DROP TABLE "bookings";

DROP TABLE "tutor_profiles";

DROP TYPE "BookingStatus";

CREATE TABLE "medicines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "status" "MedicineStatus" NOT NULL DEFAULT 'ACTIVE',
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reviews_customerId_medicineId_key" ON "reviews"("customerId", "medicineId");

ALTER TABLE "medicines" ADD CONSTRAINT "medicines_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medicines" ADD CONSTRAINT "medicines_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

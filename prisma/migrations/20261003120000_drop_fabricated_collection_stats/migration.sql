-- Drop fabricated/static marketing stat columns from Collection.
-- These are no longer stored: price ranges and listing counts are now computed
-- live from matching approved listings, and avgYield was unused.
ALTER TABLE "Collection" DROP COLUMN "avgPriceRange";
ALTER TABLE "Collection" DROP COLUMN "avgYield";
ALTER TABLE "Collection" DROP COLUMN "totalListingsText";

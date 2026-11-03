-- Index tuning for the public read paths.

-- Homepage testimonials: WHERE isPublished = true ORDER BY createdAt DESC.
CREATE INDEX `testimonials_isPublished_createdAt_idx` ON `testimonials`(`isPublished`, `createdAt`);

-- getPostsByType(): filter by category, then ORDER BY publishedAt DESC.
-- The single-column indexes left MySQL to filesort the result.
CREATE INDEX `posts_categoryId_publishedAt_idx` ON `posts`(`categoryId`, `publishedAt`);

-- Nothing filters or sorts by viewCount; the column is only ever incremented,
-- so this index was pure write overhead on every article view.
DROP INDEX `posts_viewCount_idx` ON `posts`;

-- Photos are always read as "one category, ordered by order"; an index on
-- `order` alone could not serve that.
CREATE INDEX `activity_photos_categoryId_order_idx` ON `activity_photos`(`categoryId`, `order`);
DROP INDEX `activity_photos_order_idx` ON `activity_photos`;

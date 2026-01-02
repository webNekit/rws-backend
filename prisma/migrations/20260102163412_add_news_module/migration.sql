-- CreateTable
CREATE TABLE "news_category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "news" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "news_category_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "news_news_category_id_fkey" FOREIGN KEY ("news_category_id") REFERENCES "news_category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "news_category_name_key" ON "news_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_category_slug_key" ON "news_category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

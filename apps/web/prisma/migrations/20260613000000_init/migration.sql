CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserRole" AS ENUM ('user', 'organizer', 'admin');
CREATE TYPE "OrganizerTrustLevel" AS ENUM ('pending', 'trusted', 'blocked');
CREATE TYPE "SourceType" AS ENUM ('manual', 'ics', 'google_calendar', 'meetup', 'eventbrite', 'facebook');
CREATE TYPE "AuthStatus" AS ENUM ('not_required', 'pending', 'authorized', 'expired', 'rejected');
CREATE TYPE "EventStatus" AS ENUM ('pending', 'published', 'rejected', 'cancelled', 'duplicate');
CREATE TYPE "ImportStatus" AS ENUM ('success', 'partial', 'failed');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "organizers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "website_url" TEXT,
    "contact_email" TEXT,
    "trust_level" "OrganizerTrustLevel" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizers_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "organizers" ADD CONSTRAINT "organizers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT,
    "source_type" "SourceType" NOT NULL,
    "source_name" TEXT,
    "source_url" TEXT,
    "external_source_id" TEXT,
    "auth_status" "AuthStatus" NOT NULL DEFAULT 'not_required',
    "refresh_frequency_minutes" INTEGER NOT NULL DEFAULT 720,
    "last_synced_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "sources" ADD CONSTRAINT "sources_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "source_id" TEXT,
    "organizer_id" TEXT,
    "external_event_id" TEXT,
    "source_type" "SourceType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "event_url" TEXT NOT NULL,
    "image_url" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "timezone" TEXT,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "venue_name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "price_min" DECIMAL(65,30),
    "price_max" DECIMAL(65,30),
    "currency" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'pending',
    "quality_score" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
CREATE UNIQUE INDEX "events_source_type_external_event_id_key" ON "events"("source_type", "external_event_id");
CREATE INDEX "events_status_starts_at_idx" ON "events"("status", "starts_at");
CREATE INDEX "events_city_idx" ON "events"("city");
ALTER TABLE "events" ADD CONSTRAINT "events_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

CREATE TABLE "event_topics" (
    "event_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    CONSTRAINT "event_topics_pkey" PRIMARY KEY ("event_id", "topic_id")
);
ALTER TABLE "event_topics" ADD CONSTRAINT "event_topics_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_topics" ADD CONSTRAINT "event_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "saved_events" (
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_events_pkey" PRIMARY KEY ("user_id", "event_id")
);
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "import_logs" (
    "id" TEXT NOT NULL,
    "source_id" TEXT,
    "status" "ImportStatus" NOT NULL,
    "fetched_count" INTEGER NOT NULL DEFAULT 0,
    "created_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "import_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "import_logs" ADD CONSTRAINT "import_logs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

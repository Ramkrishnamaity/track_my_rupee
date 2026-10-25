CREATE TABLE "categories" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"name" varchar(40) NOT NULL,
	"type" smallint NOT NULL,
	"status" smallint DEFAULT 1 NOT NULL,
	"colour_code" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_type_check" CHECK ("categories"."type" IN (1, 2)),
	CONSTRAINT "categories_status_check" CHECK ("categories"."status" IN (0, 1))
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_type_name_unique" ON "categories" USING btree ("user_id","type",lower("name"));--> statement-breakpoint
COMMENT ON COLUMN "categories"."type" IS '1 = income, 2 = expense';--> statement-breakpoint
COMMENT ON COLUMN "categories"."status" IS '0 = inactive, 1 = active';--> statement-breakpoint
COMMENT ON COLUMN "categories"."colour_code" IS 'Hex colour, e.g. #3B82F6';

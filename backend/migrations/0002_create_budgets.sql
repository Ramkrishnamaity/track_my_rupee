CREATE TABLE "budgets" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "budgets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	"year" smallint NOT NULL,
	"month" smallint NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"spent" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budgets_year_check" CHECK ("budgets"."year" BETWEEN 2000 AND 2100),
	CONSTRAINT "budgets_month_check" CHECK ("budgets"."month" BETWEEN 1 AND 12),
	CONSTRAINT "budgets_amount_check" CHECK ("budgets"."amount" > 0),
	CONSTRAINT "budgets_spent_check" CHECK ("budgets"."spent" >= 0)
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_user_year_month_category_unique" ON "budgets" USING btree ("user_id","year","month","category_id");--> statement-breakpoint
COMMENT ON COLUMN "budgets"."category_id" IS 'Expense category (categories.type = 2), checked by the API';--> statement-breakpoint
COMMENT ON COLUMN "budgets"."year" IS 'Budget year, e.g. 2026';--> statement-breakpoint
COMMENT ON COLUMN "budgets"."month" IS '1 = January … 12 = December';--> statement-breakpoint
COMMENT ON COLUMN "budgets"."amount" IS 'Monthly budget limit in INR';--> statement-breakpoint
COMMENT ON COLUMN "budgets"."spent" IS 'Running total of expense transactions for this category and month (INR): +amount on add, -amount on delete';

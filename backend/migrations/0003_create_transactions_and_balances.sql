CREATE TABLE "balances" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "balances_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"year" smallint NOT NULL,
	"month" smallint NOT NULL,
	"income" numeric(14, 2) DEFAULT 0 NOT NULL,
	"expense" numeric(14, 2) DEFAULT 0 NOT NULL,
	"saving" numeric(14, 2) GENERATED ALWAYS AS (income - expense) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "balances_year_check" CHECK ("balances"."year" BETWEEN 2000 AND 2100),
	CONSTRAINT "balances_month_check" CHECK ("balances"."month" BETWEEN 1 AND 12),
	CONSTRAINT "balances_income_check" CHECK ("balances"."income" >= 0),
	CONSTRAINT "balances_expense_check" CHECK ("balances"."expense" >= 0)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	"type" smallint NOT NULL,
	"payment_method" smallint NOT NULL,
	"title" varchar(120) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"year" smallint NOT NULL,
	"month" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_type_check" CHECK ("transactions"."type" IN (1, 2)),
	CONSTRAINT "transactions_payment_method_check" CHECK ("transactions"."payment_method" IN (1, 2, 3, 4)),
	CONSTRAINT "transactions_amount_check" CHECK ("transactions"."amount" > 0),
	CONSTRAINT "transactions_year_check" CHECK ("transactions"."year" BETWEEN 2000 AND 2100),
	CONSTRAINT "transactions_month_check" CHECK ("transactions"."month" BETWEEN 1 AND 12)
);
--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "balances_user_year_month_unique" ON "balances" USING btree ("user_id","year","month");--> statement-breakpoint
CREATE INDEX "transactions_user_year_month_idx" ON "transactions" USING btree ("user_id","year","month");--> statement-breakpoint
CREATE INDEX "transactions_user_date_time_idx" ON "transactions" USING btree ("user_id","date" DESC NULLS LAST,"time" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transactions_category_idx" ON "transactions" USING btree ("category_id");--> statement-breakpoint
COMMENT ON COLUMN "transactions"."category_id" IS 'Category of the same type as the transaction (checked by the API)';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."type" IS '1 = income, 2 = expense (same as categories.type)';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."payment_method" IS '1 = UPI, 2 = Card, 3 = Cash, 4 = Bank';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."title" IS 'Name shown in the table, e.g. Lunch at Swiggy';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."amount" IS 'Amount in INR, always positive; type decides income or expense';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."date" IS 'Date as entered by the user (their own clock)';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."time" IS 'Time as entered by the user (their own clock)';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."year" IS 'Taken from date';--> statement-breakpoint
COMMENT ON COLUMN "transactions"."month" IS 'Taken from date; 1 = January … 12 = December';--> statement-breakpoint
COMMENT ON TABLE "transactions" IS 'Never edited, only added or deleted';--> statement-breakpoint
COMMENT ON COLUMN "balances"."month" IS '1 = January … 12 = December';--> statement-breakpoint
COMMENT ON COLUMN "balances"."income" IS 'Total income this month (INR): +amount on add, -amount on delete';--> statement-breakpoint
COMMENT ON COLUMN "balances"."expense" IS 'Total expense this month (INR): +amount on add, -amount on delete';--> statement-breakpoint
COMMENT ON COLUMN "balances"."saving" IS 'income - expense, calculated by Postgres (can be negative)';

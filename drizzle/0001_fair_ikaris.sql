CREATE TABLE `ad_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ad_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`spend` int DEFAULT 0,
	`reach` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`ctr` int DEFAULT 0,
	`cpc` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`meta_ad_set_id` varchar(255),
	`name` varchar(255) NOT NULL,
	`daily_budget` int,
	`lifetime_budget` int,
	`targeting` text,
	`start_time` timestamp,
	`end_time` timestamp,
	`status` enum('draft','active','paused','deleted') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_sets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ad_set_id` int NOT NULL,
	`creative_id` int NOT NULL,
	`meta_ad_id` varchar(255),
	`name` varchar(255) NOT NULL,
	`status` enum('draft','active','paused','deleted') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`meta_account_id` int NOT NULL,
	`meta_campaign_id` varchar(255),
	`name` varchar(255) NOT NULL,
	`objective` varchar(100) NOT NULL,
	`status` enum('draft','active','paused','deleted') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`meta_creative_id` varchar(255),
	`name` varchar(255) NOT NULL,
	`title` varchar(255),
	`body` text,
	`call_to_action` varchar(100),
	`link_url` varchar(500),
	`image_url` varchar(500),
	`video_url` varchar(500),
	`generated_by_ai` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meta_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`meta_user_id` varchar(255) NOT NULL,
	`access_token` text NOT NULL,
	`token_expires_at` timestamp,
	`ad_account_id` varchar(255) NOT NULL,
	`ad_account_name` varchar(255),
	`business_manager_id` varchar(255),
	`active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meta_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`price_monthly` int NOT NULL,
	`max_campaigns` int NOT NULL,
	`max_ads_per_campaign` int NOT NULL,
	`ai_generations_per_month` int NOT NULL,
	`features` text,
	`active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`plan_id` int NOT NULL,
	`stripe_customer_id` varchar(255),
	`stripe_subscription_id` varchar(255),
	`status` enum('active','canceled','past_due','trialing') NOT NULL,
	`current_period_start` timestamp,
	`current_period_end` timestamp,
	`cancel_at_period_end` int DEFAULT 0,
	`ai_generations_used` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_subscriptions_id` PRIMARY KEY(`id`)
);

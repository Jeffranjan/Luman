import { pgTable, text, jsonb, timestamp, integer, vector, boolean } from 'drizzle-orm/pg-core';

export const corsairIntegrations = pgTable('corsair_integrations', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    name: text('name').notNull(),
    config: jsonb('config').notNull().default({}),
    dek: text('dek'),
});

export const corsairAccounts = pgTable('corsair_accounts', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    tenantId: text('tenant_id').notNull(),
    integrationId: text('integration_id').notNull().references(() => corsairIntegrations.id),
    config: jsonb('config').notNull().default({}),
    dek: text('dek'),
});

export const corsairEntities = pgTable('corsair_entities', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    accountId: text('account_id').notNull().references(() => corsairAccounts.id),
    entityId: text('entity_id').notNull(),
    entityType: text('entity_type').notNull(),
    version: text('version').notNull(),
    data: jsonb('data').notNull().default({}),
});

export const corsairEvents = pgTable('corsair_events', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    accountId: text('account_id').notNull().references(() => corsairAccounts.id),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull().default({}),
    status: text('status'),
});

// Better Auth Tables
export const users = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { mode: 'date' }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => users.id),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => users.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { mode: 'date' }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: 'date' }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { mode: 'date' }).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull()
});

// User Preferences
export const userPreferences = pgTable('user_preferences', {
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
    theme: text('theme').default('system').notNull(),
    keyboardMode: text('keyboard_mode').default('default').notNull(),
    timezone: text('timezone').default('UTC').notNull(),
});

// Email Threads
export const emailThreads = pgTable('email_threads', {
    threadId: text('thread_id').primaryKey(), // Gmail threadId
    entityId: text('entity_id'),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    priorityScore: text('priority_score'), // e.g. "high", "normal", "low" (using text for simplicity or real for float)
    aiSummary: text('ai_summary'), // AI-generated thread summary
    pinned: text('pinned').default('false'), // SQLite boolean compat (text or boolean depending on dialect, using postgres boolean below)
    snoozedUntil: timestamp('snoozed_until', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
});

// Emails
export const emails = pgTable('emails', {
    messageId: text('message_id').primaryKey(), // Gmail messageId
    threadId: text('thread_id').references(() => emailThreads.threadId, { onDelete: 'cascade' }),
    entityId: text('entity_id'),
    aiSummary: text('ai_summary'),
    sentiment: text('sentiment'),
});

// Attachments
export const attachments = pgTable('attachments', {
    id: text('id').primaryKey(),
    emailId: text('email_id').references(() => emails.messageId, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    mimeType: text('mime_type'),
    size: text('size'), // using text or integer
});

// Events
export const events = pgTable('events', {
    eventId: text('event_id').primaryKey(),
    entityId: text('entity_id'),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    aiSummary: text('ai_summary'),
    meetingNotes: text('meeting_notes'),
    priority: text('priority'),
});

// Search Index (with pgvector for semantic search)
export const searchIndex = pgTable('search_index', {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(), // 'email', 'event', 'thread'
    entityId: text('entity_id').notNull(), 
    title: text('title'),
    content: text('content'),
    embedding: vector('embedding', { dimensions: 1536 }),
    metadata: jsonb('metadata').default({}),
});

// Activity Feed (Timeline History)
export const activityFeed = pgTable('activity_feed', {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    action: text('action').notNull(), // 'opened', 'replied', 'archived', 'snoozed', 'ai_generated'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
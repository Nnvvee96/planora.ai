# Database Edge Functions

This directory contains Supabase Edge Functions related to database operations in Planora.

## Architecture

These functions follow Planora's architectural principles:
- Feature-first organization
- Separation of concerns
- No redundancy
- Clean code with proper error handling

## Functions

### scheduled-account-purge

An automated service that purges user accounts that have passed their 30-day recovery period.

- **Configuration**: Uses a cron schedule to run daily at midnight
- **Implementation**: Written in TypeScript using Deno runtime
- **Security**: Uses service role key for administrative operations

## Deployment

These functions are designed to be deployed to Supabase Edge Functions:

1. Install Supabase CLI
2. Link to your Supabase project
3. Deploy using the following command:

```bash
supabase functions deploy scheduled-account-purge
```

## Type Definitions

The `deno.d.ts` file provides TypeScript type declarations for Deno modules used in Supabase Edge Functions.

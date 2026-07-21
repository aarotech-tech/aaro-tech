# ADR-002: Strict Tenant Isolation via Row-Level Validation

## Context
Ensuring no client data bleeds across organizations.

## Decision
Every DB table containing client data MUST have an organization_id column. Every read/write query MUST filter by organization_id.

## Reasoning
Application-level tenant checks are the most robust way to prevent IDOR vulnerabilities in B2B SaaS without complex Row Level Security (RLS) DB configurations.

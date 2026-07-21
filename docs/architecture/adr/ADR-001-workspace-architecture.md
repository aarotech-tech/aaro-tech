# ADR-001: Move from CRM Monolith to Workspace Architecture

## Context
The original routing assumed all post-sales operations belonged under a /crm umbrella.

## Decision
Split the app into strict bounded contexts: Sales, Delivery, Finance, Directory, and Client Hub.

## Reasoning
CRM implies pre-sales. PMs and Accountants suffer cognitive overload if forced into a sales namespace.

## Consequences
Requires refactoring the Next.js app router structure.

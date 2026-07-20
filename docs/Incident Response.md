# Incident Response Plan

If the site goes down or there is a security breach:
1. **Contain**: If a bad deployment caused the issue, use Vercel to instantly rollback to the last known good deployment.
2. **Assess**: Review Vercel logs to find the root cause.
3. **Mitigate**: If it's a database corruption, initiate Neon PITR.
4. **Communicate**: Inform stakeholders.
5. **Resolve**: Push a fix.
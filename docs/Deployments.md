# Deployments

## Vercel Pipeline
Our repository is connected to Vercel. Pushing to `main` triggers a production deployment.

## Pull Requests
Any PR creates a preview deployment. Ensure you test your changes on the preview URL before merging to `main`.

> [!CAUTION]
> Do not push `.env.local` or any secrets to Git. Configure production secrets strictly via the Vercel Dashboard.
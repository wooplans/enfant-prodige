This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin séries

Le catalogue public est maintenant lu depuis Supabase. Pour initialiser le panel :

1. Créer un projet Supabase et appliquer `supabase/migrations/20260508000000_create_series_admin.sql`.
2. Copier `.env.example` vers `.env.local` puis renseigner `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` et `ADMIN_SESSION_SECRET`.
3. Générer le hash du mot de passe admin : `npm run hash:admin-password -- "votre-mot-de-passe"`, puis coller la valeur dans `ADMIN_PASSWORD_HASH`.
4. Migrer les 3 séries existantes et leurs images vers Supabase : `npm run seed:series`.
5. Lancer le site et ouvrir `/admin/login`.

Les actions admin vérifient la session côté serveur. Les séries archivées ne sont plus visibles publiquement, mais restent restaurables depuis `/admin`.

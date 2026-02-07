# Guess the Price

A mobile-first, no-scroll guessing game: slide your guess in USD, submit, then see the real price + the crowd.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

### MongoDB
Set `MONGODB_URI` in `.env.local` (and in Vercel Environment Variables).

Recommended index (create once in MongoDB/Atlas):

```js
db.submissions.createIndex({ itemID: 1, createdAt: -1 })
```

## Content
Add MDX files in `content/items/*.mdx` with:

- `itemID`
- `title`
- `imageUrl` (usually `/images/items/<file>.png`)
- `actualPrice` (number, USD)
- `referenceLink`

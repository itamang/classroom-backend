# Classroom Backend

This is the backend API for the Classroom project.

## Tech Stack

- **Express.js**: Web framework for Node.js.
- **Better Auth**: Comprehensive authentication library.
- **Drizzle ORM**: TypeScript ORM for SQL databases.
- **Neon**: Serverless PostgreSQL database.
- **APM Insight**: Application Performance Monitoring.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in this directory and add the following:

```env
DATABASE_URL=your_neon_database_url
FRONTEND_URL=http://localhost:5173
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:8000
```

### Scripts

- `npm run dev`: Start the development server with `tsx watch`.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm run start`: Run the compiled backend from `dist/`.
- `npm run db:generate`: Generate migrations using Drizzle Kit.
- `npm run db:migrate`: Apply migrations to the database.

## API Endpoints

- `GET /`: Welcome message.
- `ALL /api/auth/*`: Better Auth endpoints.
- `USE /api/subjects`: Subjects router.

## License

ISC

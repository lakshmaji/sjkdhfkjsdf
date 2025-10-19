# Timer App - Web

This is a Next.js web application for the Timer App. It uses the shared `business` package for all API calls and business logic.

## Features

- View all available rooms
- Uses the same business logic as the mobile app
- Focus on UI layer only
- Real-time updates via WebSocket (coming soon)

## Architecture

This web app follows the same architecture as the mobile app:
- **UI Layer**: React components and Next.js pages
- **Business Logic**: Imported from the `business` package
- **Persistence Layer**: Browser storage (coming soon)

## Getting Started

First, make sure the backend server is running:

```bash
cd ../server
go run main.go
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

Environment variables can be set in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8080
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Business Logic**: Shared `business` package

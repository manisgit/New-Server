# Service Management Application

A comprehensive full-stack service management application for tracking customer service requests, managing inventory, and analyzing sales performance.

## Features

- **Service Management**: Create, track, and manage customer service requests with auto-generated serial numbers
- **Inventory System**: Add and manage inventory items with quantity tracking and filtering
- **Sales Analytics**: Daily sales calculations and revenue tracking
- **Return Functionality**: Mark services as returned for unsolved problems
- **PostgreSQL Database**: Persistent data storage for all operations

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd service-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```
DATABASE_URL=your_postgresql_connection_string
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Production Build

```bash
npm run build
npm start
```

## Database Schema

The application uses two main tables:

- **services**: Customer service requests with status tracking
- **inventory**: Product inventory with quantity management

## API Endpoints

### Services
- `GET /api/services` - Retrieve all services
- `POST /api/services` - Create new service
- `PATCH /api/services/:id` - Update service status

### Inventory
- `GET /api/inventory` - Retrieve all inventory items
- `POST /api/inventory` - Create new inventory item
- `PATCH /api/inventory/:id/count` - Update inventory count

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
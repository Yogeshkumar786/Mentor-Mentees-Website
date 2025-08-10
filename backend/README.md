# Mentor-Mentees Backend

This is the backend for the Mentor-Mentees website, now using Prisma as the ORM.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mentor_mentees_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=5000
NODE_ENV="development"
```

### 3. Database Setup
Make sure you have PostgreSQL installed and running. Then:

```bash
# Generate Prisma client
npm run db:generate

# Push the schema to your database
npm run db:push

# Or create a migration
npm run db:migrate
```

### 4. Run the Development Server
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply database migrations
- `npm run db:studio` - Open Prisma Studio for database management

## Database Schema

The Prisma schema includes the following models:

- **Student** - Student information and academic records
- **Faculty** - Faculty members who can mentor students
- **HOD** - Head of Department information
- **Meeting** - Meeting scheduling between faculty and students
- **Message** - Communication between faculty and students
- **CareerDetails** - Student career preferences and interests
- **PersonalProblem** - Student personal issues and challenges
- **Internship** - Student internship records
- **Project** - Student project information
- **CoCurricular** - Student extracurricular activities
- **Semester** - Academic semester records
- **Subject** - Subject-wise academic performance

## Migration from Mongoose

This project has been migrated from Mongoose to Prisma. The new schema maintains all the relationships and data structures from the original Mongoose models while providing:

- Type-safe database operations
- Better performance
- Automatic migrations
- Database introspection
- Prisma Studio for database management 
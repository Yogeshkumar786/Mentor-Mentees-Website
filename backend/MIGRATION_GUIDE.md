# Migration Guide: Mongoose to Prisma

This guide helps you migrate from Mongoose to Prisma in your Mentor-Mentees website backend.

## Key Changes

### 1. Database Connection
**Before (Mongoose):**
```typescript
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
```

**After (Prisma):**
```typescript
import { prisma } from './lib/prisma';
// Connection is handled automatically by Prisma
```

### 2. Model Definitions
**Before (Mongoose):**
```typescript
const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
});
const Student = mongoose.model('Student', studentSchema);
```

**After (Prisma):**
```typescript
// Defined in schema.prisma
model Student {
  id    String @id @default(cuid())
  name  String
  email String @unique
}
```

### 3. Database Operations

#### Find All
**Before (Mongoose):**
```typescript
const students = await Student.find().populate('mentors');
```

**After (Prisma):**
```typescript
const students = await prisma.student.findMany({
  include: { mentors: true }
});
```

#### Find One
**Before (Mongoose):**
```typescript
const student = await Student.findById(id).populate('mentors');
```

**After (Prisma):**
```typescript
const student = await prisma.student.findUnique({
  where: { id },
  include: { mentors: true }
});
```

#### Create
**Before (Mongoose):**
```typescript
const student = new Student(data);
await student.save();
```

**After (Prisma):**
```typescript
const student = await prisma.student.create({
  data: data
});
```

#### Update
**Before (Mongoose):**
```typescript
await Student.findByIdAndUpdate(id, updateData);
```

**After (Prisma):**
```typescript
await prisma.student.update({
  where: { id },
  data: updateData
});
```

#### Delete
**Before (Mongoose):**
```typescript
await Student.findByIdAndDelete(id);
```

**After (Prisma):**
```typescript
await prisma.student.delete({
  where: { id }
});
```

### 4. Relationships

#### One-to-Many
**Before (Mongoose):**
```typescript
// In Student model
mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }]

// Query with populate
const student = await Student.findById(id).populate('mentors');
```

**After (Prisma):**
```typescript
// In schema.prisma
model Student {
  mentors Faculty[] @relation("StudentMentors")
}

// Query with include
const student = await prisma.student.findUnique({
  where: { id },
  include: { mentors: true }
});
```

#### Many-to-Many
**Before (Mongoose):**
```typescript
// In Student model
internships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Internship" }]

// In Internship model
// No direct reference back
```

**After (Prisma):**
```typescript
// In schema.prisma
model Student {
  internships Internship[]
}

model Internship {
  students Student[]
}
```

### 5. Type Safety

**Before (Mongoose):**
```typescript
interface IStudent {
  name: string;
  email: string;
}
// Types were separate from runtime
```

**After (Prisma):**
```typescript
// Types are automatically generated
import { Student, Prisma } from '@prisma/client';

// Use generated types
type StudentWithMentors = Prisma.StudentGetPayload<{
  include: { mentors: true }
}>;
```

## Migration Steps

### 1. Install Prisma
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma
```bash
npx prisma init
```

### 3. Create Schema
- Copy the provided `schema.prisma` file
- Adjust field names and types as needed
- Set up your database connection

### 4. Generate Client
```bash
npx prisma generate
```

### 5. Push Schema
```bash
npx prisma db push
```

### 6. Update Controllers
- Replace Mongoose operations with Prisma equivalents
- Update import statements
- Modify relationship queries

### 7. Test Thoroughly
- Test all CRUD operations
- Verify relationships work correctly
- Check data integrity

## Benefits of Prisma

1. **Type Safety**: Full TypeScript support with auto-generated types
2. **Performance**: Better query optimization and connection pooling
3. **Developer Experience**: Auto-completion, error checking, and better tooling
4. **Migrations**: Automatic database schema management
5. **Relationships**: Easier to work with complex relationships
6. **Studio**: Built-in database management interface

## Common Pitfalls

1. **Field Naming**: Prisma uses camelCase by default, adjust if needed
2. **Relationships**: Ensure both sides of relationships are properly defined
3. **Transactions**: Use Prisma transactions for complex operations
4. **Error Handling**: Prisma errors are more specific, update error handling
5. **Connection Management**: Prisma handles connections automatically

## Need Help?

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Examples](https://github.com/prisma/prisma-examples)
- [Prisma Community](https://community.prisma.io/) 
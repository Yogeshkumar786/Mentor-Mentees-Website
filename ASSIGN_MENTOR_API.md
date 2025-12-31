# HOD Assign Mentor API Documentation

## Overview
This API allows HOD (Head of Department) to assign faculty members as mentors to students.

## Endpoints

### 1. Assign Mentor to Single Student

#### Node.js/TypeScript Backend
**POST** `/api/hod/assign-mentor`

#### Python/Django Backend
**POST** `/api/hod/assign-mentor`

## Authentication
- **Required**: Yes
- **Role**: HOD only
- **Method**: JWT token in httpOnly cookie

## Request Body

```json
{
  "studentRollNumber": 12345,
  "facultyEmployeeId": "FAC001",
  "year": 2,
  "semester": 3
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| studentRollNumber | number/string | Yes | Student's roll number |
| facultyEmployeeId | string | Yes | Faculty's employee ID |
| year | number | Yes | Academic year (e.g., 1, 2, 3, 4) |
| semester | number | Yes | Semester number (1-8) |

## Response

### Success (201 Created)

```json
{
  "message": "Mentor assigned successfully",
  "assignment": {
    "id": "clx1234567890",
    "student": {
      "name": "John Doe",
      "rollNumber": 12345,
      "branch": "Computer Science"
    },
    "mentor": {
      "name": "Dr. Jane Smith",
      "employeeId": "FAC001",
      "department": "Computer Science"
    },
    "year": 2,
    "semester": 3,
    "startDate": "2025-12-27T11:30:00.000Z",
    "assignedBy": "Dr. HOD Name"
  },
  "previousMentor": "Dr. Previous Mentor" // or null if no previous mentor
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "message": "Missing required fields: studentRollNumber, facultyEmployeeId, year, semester"
}
```

#### 401 Unauthorized
```json
{
  "message": "User not authenticated"
}
```

#### 403 Forbidden
```json
{
  "message": "You are not authorized to assign mentors in the Computer Science department"
}
```

#### 404 Not Found
```json
{
  "message": "Student not found with the provided roll number"
}
```
or
```json
{
  "message": "Faculty not found with the provided employee ID"
}
```

## Features

1. **Authorization Check**: Only HOD of the same department can assign mentors
2. **Automatic Deactivation**: If student already has an active mentor, it will be automatically deactivated
3. **History Tracking**: Previous mentor information is returned in the response
4. **Complete Audit Trail**: Tracks who assigned the mentor and when

## Testing with Postman/cURL

### cURL Example
```bash
curl -X POST http://localhost:5000/api/hod/assign-mentor \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "studentRollNumber": 12345,
    "facultyEmployeeId": "FAC001",
    "year": 2,
    "semester": 3
  }'
```

### Postman
1. Create POST request to `/api/hod/assign-mentor`
2. Set Headers: `Content-Type: application/json`
3. Ensure JWT token cookie is included (login first as HOD)
4. Add request body with required fields

## Database Changes

### Mentor Table
- Creates new mentor record with `isActive = true`
- Sets `startDate` to current timestamp
- Links faculty and student

### Student Table
- Updates `currentMentorId` to new mentor assignment ID

### Previous Mentor (if exists)
- Sets `isActive = false`
- Sets `endDate` to current timestamp

## Business Logic

1. Validates all required fields
2. Authenticates user as HOD
3. Finds student by roll number
4. Finds faculty by employee ID
5. Verifies HOD has authority over faculty's department
6. Deactivates any existing active mentor for the student
7. Creates new mentor assignment
8. Updates student's current mentor reference
9. Returns complete assignment details

## Notes

- A student can only have one active mentor at a time
- The HOD must be from the same department as the faculty being assigned
- All timestamps are stored in UTC
- Previous mentorship history is preserved in the database

---

## 2. Assign Mentor to Multiple Students (Bulk Assignment)

### Endpoints

#### Node.js/TypeScript Backend
**POST** `/api/hod/assign-mentor-bulk`

#### Python/Django Backend
**POST** `/api/hod/assign-mentor-bulk`

### Authentication
- **Required**: Yes
- **Role**: HOD only
- **Method**: JWT token in httpOnly cookie

### Request Body

```json
{
  "studentRollNumbers": [22001, 22002, 22003],
  "facultyEmployeeId": "FAC001",
  "year": 2,
  "semester": 3
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| studentRollNumbers | number[] | Yes | Array of student roll numbers |
| facultyEmployeeId | string | Yes | Faculty's employee ID |
| year | number | Yes | Academic year (e.g., 1, 2, 3, 4) |
| semester | number | Yes | Semester number (1-8) |

### Response

#### Success (201 Created)

```json
{
  "message": "Assigned 3 student(s) to Dr. Ramesh Sharma",
  "mentor": {
    "name": "Dr. Ramesh Sharma",
    "employeeId": "FAC001",
    "department": "Computer Science"
  },
  "year": 2,
  "semester": 3,
  "assignedBy": "Dr. HOD Name",
  "results": {
    "successful": [
      {
        "student": {
          "name": "Rahul Kumar",
          "rollNumber": 22001,
          "branch": "Computer Science"
        },
        "previousMentor": "Dr. Previous Mentor",
        "newMentorAssignmentId": "clx1234567890"
      },
      {
        "student": {
          "name": "Priya Sharma",
          "rollNumber": 22002,
          "branch": "Computer Science"
        },
        "previousMentor": null,
        "newMentorAssignmentId": "clx1234567891"
      },
      {
        "student": {
          "name": "Amit Patel",
          "rollNumber": 22003,
          "branch": "Computer Science"
        },
        "previousMentor": "Dr. Old Mentor",
        "newMentorAssignmentId": "clx1234567892"
      }
    ],
    "failed": [],
    "totalProcessed": 3,
    "successCount": 3,
    "failedCount": 0
  }
}
```

#### Partial Success (201 Created)

When some students fail to be assigned:

```json
{
  "message": "Assigned 2 student(s) to Dr. Ramesh Sharma",
  "mentor": {
    "name": "Dr. Ramesh Sharma",
    "employeeId": "FAC001",
    "department": "Computer Science"
  },
  "year": 2,
  "semester": 3,
  "assignedBy": "Dr. HOD Name",
  "results": {
    "successful": [
      {
        "student": {
          "name": "Rahul Kumar",
          "rollNumber": 22001,
          "branch": "Computer Science"
        },
        "previousMentor": null,
        "newMentorAssignmentId": "clx1234567890"
      },
      {
        "student": {
          "name": "Priya Sharma",
          "rollNumber": 22002,
          "branch": "Computer Science"
        },
        "previousMentor": null,
        "newMentorAssignmentId": "clx1234567891"
      }
    ],
    "failed": [
      {
        "rollNumber": 99999,
        "reason": "Student not found"
      }
    ],
    "totalProcessed": 3,
    "successCount": 2,
    "failedCount": 1
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "message": "studentRollNumbers must be a non-empty array"
}
```

```json
{
  "message": "Missing required fields: facultyEmployeeId, year, semester"
}
```

#### 401 Unauthorized
```json
{
  "message": "User not authenticated"
}
```

#### 403 Forbidden
```json
{
  "message": "You are not authorized to assign mentors in the Computer Science department"
}
```

#### 404 Not Found
```json
{
  "message": "Faculty not found with the provided employee ID"
}
```

### Features

1. **Bulk Assignment**: Assign one faculty to multiple students in a single request
2. **Authorization Check**: Only HOD of the same department can assign mentors
3. **Automatic Deactivation**: Previous mentors are automatically deactivated for each student
4. **Detailed Results**: Returns success and failure details for each student
5. **Partial Success Handling**: Continues processing even if some students fail
6. **History Tracking**: Previous mentor information tracked for each assignment

### Testing with Postman/cURL

#### cURL Example
```bash
curl -X POST http://localhost:3000/api/hod/assign-mentor-bulk \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "studentRollNumbers": [22001, 22002],
    "facultyEmployeeId": "FAC001",
    "year": 2,
    "semester": 3
  }'
```

### Business Logic

1. Validates all required fields including array format
2. Authenticates user as HOD
3. Finds faculty by employee ID
4. Verifies HOD has authority over faculty's department
5. For each student in the array:
   - Finds student by roll number
   - Deactivates any existing active mentor
   - Creates new mentor assignment
   - Updates student's current mentor reference
   - Tracks success or failure
6. Returns detailed results with counts

### Use Cases

- **Batch Mentor Assignment**: Assign a faculty to an entire class section
- **Mentor Reallocation**: Transfer multiple students from one mentor to another
- **New Academic Year Setup**: Bulk assign mentors at the start of semester
- **Department Reorganization**: Reassign students when faculty changes

### Important Notes

- All students must belong to the HOD's department
- Failed assignments don't affect successful ones
- Previous mentor relationships are preserved in history
- Response includes both successful and failed assignments
- Empty array returns 400 error

---
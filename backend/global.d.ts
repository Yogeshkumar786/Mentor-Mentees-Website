import { Request } from 'express';

// ==================== User Related Types ====================

/**
 * User Role Enum
 * Defines the different types of users in the system
 */
export type UserRole = 'STUDENT' | 'FACULTY' | 'HOD' | 'ADMIN';

/**
 * User Account Status Enum
 * Defines the status of a user account
 */
export type UserAccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * User Interface
 * Represents the centralized User model that handles authentication
 */
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string | null;
  accountStatus: UserAccountStatus;
  
  // Relations (one-to-one with entity models)
  student?: Student | null;
  faculty?: Faculty | null;
  hod?: HOD | null;
  admin?: Admin | null;
  
  // Message relations
  sentMessages?: Message[];
  receivedMessages?: Message[];
}

/**
 * Authenticated User Information
 * The user object attached to requests after authentication
 */
export interface AuthUser {
  id: string;              // User table ID
  email: string;           // User email
  role: UserRole;          // User role
  entityId: string;        // ID of the Student/Faculty/HOD/Admin record
  entity?: unknown;        // The actual Student/Faculty/HOD/Admin record with all details
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// ==================== JWT Token Payload ====================

/**
 * JWT Token Payload
 * The data encoded in JWT tokens
 */
export interface JwtPayload {
  id: string;              // User ID (from User table, not entity ID)
  iat?: number;            // Issued at
  exp?: number;            // Expiration time
}

// ==================== Global Express Namespace Extension ====================

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
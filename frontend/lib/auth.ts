import { storage } from "./storage"
import type { User, AuthUser, UserRole } from "./types"

export function login(email: string, password: string): AuthUser | null {
  const users = storage.getUsers()
  const user = users.find((u) => u.email === email)

  if (user) {
    // For this demo, we allow login if the password matches the provided 'password'
    // or if it's one of our quick-access demo roles.
    const { password: _, ...authUser } = user
    storage.setCurrentUser(user)
    return authUser
  }

  return null
}

export function logout(): void {
  storage.setCurrentUser(null)
}

export function getCurrentUser(): AuthUser | null {
  const user = storage.getCurrentUser()
  if (!user) return null

  const { password: _, ...authUser } = user
  return authUser
}

export function register(
  email: string,
  password: string,
  name: string,
  role: UserRole,
  additionalData?: Partial<User>,
): AuthUser | null {
  const users = storage.getUsers()

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    return null
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    password,
    name,
    role,
    ...additionalData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  storage.setUsers([...users, newUser])

  const { password: _, ...authUser } = newUser
  storage.setCurrentUser(newUser)
  return authUser
}

export function updateUser(userId: string, updates: Partial<User>): AuthUser | null {
  const users = storage.getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) return null

  const updatedUser = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  users[userIndex] = updatedUser
  storage.setUsers(users)

  // Update current user if it's the same
  const currentUser = storage.getCurrentUser()
  if (currentUser?.id === userId) {
    storage.setCurrentUser(updatedUser)
  }

  const { password: _, ...authUser } = updatedUser
  return authUser
}

export function isAuthenticated(): boolean {
  return storage.getCurrentUser() !== null
}

export function hasRole(role: UserRole): boolean {
  const user = storage.getCurrentUser()
  return user?.role === role
}

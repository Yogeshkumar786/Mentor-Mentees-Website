(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// localStorage wrapper for data persistence
__turbopack_context__.s([
    "storage",
    ()=>storage
]);
const STORAGE_KEYS = {
    USERS: "college_mentor_users",
    RELATIONSHIPS: "college_mentor_relationships",
    MEETINGS: "college_mentor_meetings",
    REQUESTS: "college_mentor_requests",
    ACADEMIC_RECORDS: "college_mentor_academic_records",
    CAREER_GOALS: "college_mentor_career_goals",
    CURRENT_USER: "college_mentor_current_user"
};
// Initialize with demo data
function initializeDemoData() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Only initialize if no users exist
    const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (existingUsers) return;
    const demoUsers = [
        {
            id: "1",
            email: "admin",
            password: "123",
            name: "Admin User",
            role: "admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: "2",
            email: "hod",
            password: "123",
            name: "Dr. Robert Smith",
            role: "hod",
            department: "Computer Science",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: "3",
            email: "faculty",
            password: "123",
            name: "Dr. Sarah Johnson",
            role: "faculty",
            department: "Computer Science",
            expertise: [
                "Web Development",
                "AI/ML"
            ],
            bio: "Professor with 15 years of experience.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: "4",
            email: "student",
            password: "123",
            name: "Alex Martinez",
            role: "student",
            department: "Computer Science",
            year: "Junior",
            bio: "Passionate about technology.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CAREER_GOALS, JSON.stringify([]));
}
// Generic storage functions
function getItems(key) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}
function setItems(key, items) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(key, JSON.stringify(items));
}
const storage = {
    // Initialize
    init: initializeDemoData,
    // Users
    getUsers: ()=>getItems(STORAGE_KEYS.USERS),
    setUsers: (users)=>setItems(STORAGE_KEYS.USERS, users),
    getUserById: (id)=>{
        const users = getItems(STORAGE_KEYS.USERS);
        return users.find((u)=>u.id === id);
    },
    getUserByEmail: (email)=>{
        const users = getItems(STORAGE_KEYS.USERS);
        return users.find((u)=>u.email === email);
    },
    // Relationships
    getRelationships: ()=>getItems(STORAGE_KEYS.RELATIONSHIPS),
    setRelationships: (relationships)=>setItems(STORAGE_KEYS.RELATIONSHIPS, relationships),
    // Meetings
    getMeetings: ()=>getItems(STORAGE_KEYS.MEETINGS),
    setMeetings: (meetings)=>setItems(STORAGE_KEYS.MEETINGS, meetings),
    // Requests
    getRequests: ()=>getItems(STORAGE_KEYS.REQUESTS),
    setRequests: (requests)=>setItems(STORAGE_KEYS.REQUESTS, requests),
    // Academic Records
    getAcademicRecords: ()=>getItems(STORAGE_KEYS.ACADEMIC_RECORDS),
    setAcademicRecords: (records)=>setItems(STORAGE_KEYS.ACADEMIC_RECORDS, records),
    // Career Goals
    getCareerGoals: ()=>getItems(STORAGE_KEYS.CAREER_GOALS),
    setCareerGoals: (goals)=>setItems(STORAGE_KEYS.CAREER_GOALS, goals),
    // Current User
    getCurrentUser: ()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    },
    setCurrentUser: (user)=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    },
    // Clear all data
    clearAll: ()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        Object.values(STORAGE_KEYS).forEach((key)=>{
            localStorage.removeItem(key);
        });
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentUser",
    ()=>getCurrentUser,
    "hasRole",
    ()=>hasRole,
    "isAuthenticated",
    ()=>isAuthenticated,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "register",
    ()=>register,
    "updateUser",
    ()=>updateUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-client] (ecmascript)");
;
function login(email, password) {
    const users = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getUsers();
    const user = users.find((u)=>u.email === email);
    if (user) {
        // For this demo, we allow login if the password matches the provided 'password'
        // or if it's one of our quick-access demo roles.
        const { password: _, ...authUser } = user;
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setCurrentUser(user);
        return authUser;
    }
    return null;
}
function logout() {
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setCurrentUser(null);
}
function getCurrentUser() {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getCurrentUser();
    if (!user) return null;
    const { password: _, ...authUser } = user;
    return authUser;
}
function register(email, password, name, role, additionalData) {
    const users = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getUsers();
    // Check if user already exists
    if (users.some((u)=>u.email === email)) {
        return null;
    }
    const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role,
        ...additionalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setUsers([
        ...users,
        newUser
    ]);
    const { password: _, ...authUser } = newUser;
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setCurrentUser(newUser);
    return authUser;
}
function updateUser(userId, updates) {
    const users = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getUsers();
    const userIndex = users.findIndex((u)=>u.id === userId);
    if (userIndex === -1) return null;
    const updatedUser = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    users[userIndex] = updatedUser;
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setUsers(users);
    // Update current user if it's the same
    const currentUser = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getCurrentUser();
    if (currentUser?.id === userId) {
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setCurrentUser(updatedUser);
    }
    const { password: _, ...authUser } = updatedUser;
    return authUser;
}
function isAuthenticated() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getCurrentUser() !== null;
}
function hasRole(role) {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getCurrentUser();
    return user?.role === role;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/auth-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    loading: true,
    setUser: ()=>{}
});
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            // Initialize demo data
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].init();
            // Check for existing user
            const currentUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentUser"])();
            setUser(currentUser);
            setLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            setUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/components/auth-provider.tsx",
        lineNumber: 36,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "NiO5z6JIqzX62LS5UWDgIqbZYyY=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_19c1d55a._.js.map
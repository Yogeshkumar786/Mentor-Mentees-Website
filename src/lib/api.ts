// API utility functions for making authenticated requests
// Uses cookies instead of Authorization headers

const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic API request function with cookie support
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      credentials: 'include', // Important: This ensures cookies are sent
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Authentication API functions
export const authAPI = {
  // Unified login for all user types
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Logout (clears cookie)
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
};

// Faculty API functions
export const facultyAPI = {
  // Create new meeting
  createMeeting: async (meetingData: {
    studentIds: string[];
    date: string;
    time: string;
    description: string;
    isHOD?: boolean;
  }) => {
    return apiRequest('/faculty/meeting/new', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },
};

// HOD API functions
export const hodAPI = {
  // Create new meeting
  createMeeting: async (meetingData: {
    studentIds: string[];
    date: string;
    time: string;
    description: string;
    facultyId: string;
  }) => {
    return apiRequest('/hod/meeting/new', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },
};

// Student API functions
export const studentAPI = {
  // Get student profile
  getProfile: async () => {
    return apiRequest('/student/profile', {
      method: 'GET',
    });
  },
};

export default apiRequest;

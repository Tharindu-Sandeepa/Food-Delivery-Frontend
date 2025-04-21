import { API_BASE_URL } from '../constants/endpoints';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  phone?: string;
  address?: string;
}

interface FetchUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const fetchUsers = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  }
): Promise<FetchUsersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/users?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    
    // Ensure the response matches your expected structure
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    return {
      success: true,
      data: data.data || [],
      pagination: data.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: data.total || 0,
        pages: data.pages || 1
      }
    };
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

export const updateUserStatus = async (
  token: string,
  userId: string,
  isActive: boolean
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user status');
  }

  const data = await response.json();
  return data.data;
};

export const updateUserRole = async (
  token: string,
  userId: string,
  role: string
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      
    },
    credentials: 'include',
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }

  const data = await response.json();
  return data.data;
};
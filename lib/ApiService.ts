import useAuthStore from '@/stores/authStore';
import axios, { AxiosResponse } from 'axios';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  video_count:number
}

interface Lecture {
  id: string;
  title: string;
  file_url: string;
  thumbnail_url: string;
  file_size: number;
  videoUrl?: string;
  stream_url?: string;
  duration?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
}

// Base URL for all API requests
const API_BASE_URL = 'http://18.216.181.203:5000/api';
//const API_BASE_URL = 'https://lwj8k3bb-5000.inc1.devtunnels.ms/api';

// Create a separate axios instance for auth requests (login)
// This instance doesn't have the 401 interceptor to avoid redirect loops
const authAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add the ngrok-skip-browser-warning header to auth requests
authAxiosInstance.interceptors.request.use(
  (config) => {
    config.headers['ngrok-skip-browser-warning'] = '69420';
    return config;
  },
  (error) => Promise.reject(error)
);

// Main axios instance for authenticated requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['ngrok-skip-browser-warning'] = '69420';
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to redirect to login page
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    // Check if we're not already on the login page to avoid redirect loops
    if (!window.location.pathname.includes('/auth/Login')) {
      window.location.href = '/auth/Login';
    }
  }
};

// Handle 401 errors for authenticated requests
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 errors if we're not already on the login page
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear auth store
      useAuthStore.getState().clearAuth();
      // Redirect to login page
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export const createCourse = async (courseData: {
  title: string;
  description: string;
  thumbnail?: File;
}): Promise<Course> => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('description', courseData.description);
  if (courseData.thumbnail) {
    formData.append('thumbnail', courseData.thumbnail);
  }

  try {
    const response: AxiosResponse<Course> = await axiosInstance.post('/admin/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create course');
  }
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/admin/courses/${courseId}`);
  } catch (error) {
    throw new Error('Failed to delete course');
  }
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    // Use authAxiosInstance for login requests to avoid redirect loops on 401 errors
    const response = await authAxiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // Just throw the error without redirecting
    throw error;
  }
};

export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response: AxiosResponse<Course[]> = await axiosInstance.get('/courses');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch courses');
  }
};

export const fetchCourseById = async (id: string)=> {
  try {
    const response = await axiosInstance.get(`admin/courses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch course with id: ${id}`);
  }
};

export const fetchCourseLectures = async (courseId: string): Promise<Lecture[]> => {
  try {
    const response: AxiosResponse<Lecture[]> = await axiosInstance.get(`/admin/courses/${courseId}/videos`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch lectures');
  }
};

export const addVideoToCourse = async (videoData: {
  courseId: string;
  title: string;
  file: File;
  thumbnail: File;
  file_size: number;
}) => {
  const formData = new FormData();
  formData.append('title', videoData.title);
  formData.append('file', videoData.file);
  formData.append('thumbnail', videoData.thumbnail);
  formData.append('file_size', videoData.file_size.toString());

  try {
    const response = await axiosInstance.post(`/admin/courses/${videoData.courseId}/videos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add video');
  }
};

export const deleteVideo = async (videoId: string) => {
  try {
    const response = await axiosInstance.delete(`/admin/videos/${videoId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete video');
  }
};

export const updateVideo = async (videoData: {
  videoId: string;
  title: string;
  file?: File;
  thumbnail?: File;
  file_size?: number;
}) => {
  const formData = new FormData();
  formData.append('title', videoData.title);

  if (videoData.file) {
    formData.append('file', videoData.file);
    formData.append('file_size', videoData.file_size?.toString() || '0');
  }

  if (videoData.thumbnail) {
    formData.append('thumbnail', videoData.thumbnail);
  }

  try {
    const response = await axiosInstance.put(`/admin/videos/${videoData.videoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update video');
  }
};


export const updateCourse = async ({
  courseId,
  title,
  description,
  thumbnail,
}: {
  courseId: string;
  title: string;
  description: string;
  thumbnail?: File | null;
}): Promise<Course> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  if (thumbnail) {
    formData.append('thumbnail', thumbnail);
  }

  try {
    const response = await axiosInstance.put(`/admin/courses/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update course');
  }
};

// User Management API Functions
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response: AxiosResponse<User[]> = await axiosInstance.get('/admin/users');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};

export const updateUserAdminStatus = async (userId: number, isAdmin: boolean): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await axiosInstance.put(`/admin/users/${userId}/admin`, {
      is_admin: isAdmin
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update user admin status');
  }
};
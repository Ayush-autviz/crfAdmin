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
}

const axiosInstance = axios.create({
  baseURL: 'https://lwj8k3bb-5000.inc1.devtunnels.ms/api',
});

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

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/Login'; // Client-side redirect
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth store using clearAuth
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
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
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
    const response: AxiosResponse<Lecture[]> = await axiosInstance.get(`/admin/videos/${courseId}`);
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
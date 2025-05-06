import axios, { AxiosResponse } from 'axios';

interface Course {
  // Define your Course interface here
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': 'Bearer <YOUR_JWT_TOKEN>',
  },
});

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

export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response: AxiosResponse<Course[]> = await axiosInstance.get('/courses');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch courses');
  }
};
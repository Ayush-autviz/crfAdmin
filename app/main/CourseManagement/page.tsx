'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Edit, Trash, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import { FormError } from '@/components/ui/form-error';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCourse, deleteCourse, fetchCourses } from '@/lib/ApiService';
import { createCourseSchema, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/validations';
import { validateForm, validateFileUpload } from '@/lib/validateForm';
import { Skeleton } from '@/components/ui/skeleton';

// Course interface
interface Course {
  id: string;
  title: string;
  description:string;
  video_count: number;
}




export default function AdminDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState<string>('');
  const [newCourseCategory, setNewCourseCategory] = useState<string>('');
  const [newCourseLevel, setNewCourseLevel] = useState<string>('');
  const [newCourseDescription, setNewCourseDescription] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  // Update thumbnail preview when file changes
  useEffect(() => {
    if (thumbnailFile) {
      const objectUrl = URL.createObjectURL(thumbnailFile);
      setThumbnailPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setThumbnailPreview(null);
    }
  }, [thumbnailFile]);

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      setIsCreateDialogOpen(false);
      setNewCourseTitle('');
      setNewCourseCategory('');
      setNewCourseLevel('');
      setNewCourseDescription('');
      setThumbnailFile(null);

      toast('Course Created', {
        description: 'Your new course has been created successfully.',
      });

      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: any) => {
      console.error("Create course failed:", error);

      // Default error message
      let errorMessage = "Failed to create course. Please try again.";

      // Use error.response.data.error for the toast description if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      toast('Error', {
        description: errorMessage,
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      toast('Course Deleted', {
        description: 'The course has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: (error: any) => {
      console.error("Delete course failed:", error);

      // Default error message
      let errorMessage = "Failed to delete course. Please try again.";

      // Use error.response.data.error for the toast description if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      toast('Error', {
        description: errorMessage,
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  const handleCreateCourse = (): void => {
    // Clear previous errors
    setFormErrors({});

    // Validate file first
    if (thumbnailFile) {
      const fileValidation = validateFileUpload(thumbnailFile, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
      if (!fileValidation.valid && fileValidation.error) {
        setFormErrors({ thumbnail: fileValidation.error });
        return;
      }
    }

    // Validate form data
    const validation = validateForm(createCourseSchema, {
      title: newCourseTitle,
      description: newCourseDescription,
      thumbnail: thumbnailFile,
    });

    if (!validation.success) {
      // Set form errors
      if (validation.errors) {
        setFormErrors(validation.errors);
      }
      return;
    }

    // Submit the form if validation passes
    createCourseMutation.mutate({
      title: newCourseTitle,
      description: newCourseDescription,
      thumbnail: thumbnailFile || undefined,
    });
  };

  const handleDeleteCourse = (id: string): void => {
    setCourseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (): void => {
    if (courseToDelete) {
      deleteCourseMutation.mutate(courseToDelete);
    }
  };

  const handleEditCourse = (id: string): void => {
    router.push(`/main/CourseManagement/course/${id}`);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white font-bold mb-2">Course Management</h1>
          <p className="text-sm text-[#A4A4A4]">Create and manage your digital courses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]">
              <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50]">
            <DialogHeader>
              <DialogTitle className='text-xl text-white font-bold'>Create New Course</DialogTitle>
              <DialogDescription className="text-[#A4A4A4] text-sm">
                Fill in the details below to create a new course.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourseTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewCourseTitle(e.target.value)
                  }
                  placeholder="Enter course title"
                  className={`bg-[#334155] border-0 mt-2 placeholder:text-white ${formErrors.title ? 'border-red-500' : ''}`}
                />
                <FormError message={formErrors.title} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourseDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewCourseDescription(e.target.value)
                  }
                  placeholder="Enter course description"
                  className={`bg-[#334155] border-0 mt-2 text-white placeholder:text-white ${formErrors.description ? 'border-red-500' : ''}`}
                />
                <FormError message={formErrors.description} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-thumbnail">Thumbnail</Label>
                <div className="flex items-center justify-center w-full mt-2">
                  <label
                    htmlFor="create-thumbnail"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 ${formErrors.thumbnail ? 'border-red-500' : 'border-[#323D50]'} border-dashed rounded-lg cursor-pointer bg-[#0F1623] hover:bg-[#1F2A3C] transition-colors`}
                  >
                    {thumbnailPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="object-cover rounded-lg w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm">Change thumbnail</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-[#A4A4A4]" />
                        <p className="mb-2 text-sm text-[#A4A4A4]">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-[#A4A4A4]">PNG, JPG or GIF</p>
                      </div>
                    )}
                    <input
                      id="create-thumbnail"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // Clear previous errors
                        const newErrors = { ...formErrors };
                        delete newErrors.thumbnail;
                        setFormErrors(newErrors);

                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const validation = validateFileUpload(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
                          if (!validation.valid && validation.error) {
                            setFormErrors({ ...newErrors, thumbnail: validation.error });
                            e.target.value = '';
                            return;
                          }
                        }
                        setThumbnailFile(file);
                      }}
                    />
                  </label>
                </div>
                <FormError message={formErrors.thumbnail} />
              </div>
            </div>
            <DialogFooter>
              <Button
                className='text-black'
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                onClick={handleCreateCourse}
                disabled={createCourseMutation.isPending}
              >
                {createCourseMutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#162033] shadow-lg">
          <CardHeader className="mb-0">
            <CardTitle className="text-2xl text-white font-bold">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent className='mt-0'>
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-[#334155]" />
            ) : (
              <div className="text-2xl text-[#F6BE00] font-bold">{courses.length}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#162033] shadow-lg">
          <CardHeader className="">
            <CardTitle className="text-2xl text-white font-bold">
              Total Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-[#334155]" />
            ) : (
              <div className="text-2xl text-[#F6BE00] font-bold">
                {courses.reduce((total, course) => total + course.video_count, 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#162033] shadow-lg">
        <CardHeader>
          <CardTitle className='text-2xl text-white font-bold'>Course Library</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-1/4 bg-[#334155]" />
                <Skeleton className="h-6 w-1/4 bg-[#334155]" />
                <Skeleton className="h-6 w-1/4 bg-[#334155]" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 py-4 border-b border-[#323D50]">
                  <Skeleton className="h-5 w-1/3 bg-[#334155]" />
                  <Skeleton className="h-5 w-16 bg-[#334155]" />
                  <div className="flex-1 flex justify-end space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md bg-[#334155]" />
                    <Skeleton className="h-8 w-8 rounded-md bg-[#334155]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to load courses</h3>
              <p className="text-[#A4A4A4] mb-4">There was a problem loading your courses.</p>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['courses'] })}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#A4A4A4] mb-4">No courses found</p>
              <Button
                className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Course
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#334155]">
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Lectures</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-[#334155]">
                    <TableCell className="font-medium text-white">{course.title}</TableCell>
                    <TableCell className='text-white'>{course?.video_count || 0 }</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCourse(course.id)}
                      >
                        <Edit color='#FFC107' className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deleteCourseMutation.isPending}
                      >
                        <Trash color='#FFC107' className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50]">
          <DialogHeader>
            <DialogTitle className='text-xl text-white font-bold'>Delete Course</DialogTitle>
            <DialogDescription className="text-[#A4A4A4] text-sm">
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className='text-black'
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCourseToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
              disabled={deleteCourseMutation.isPending}
            >
              {deleteCourseMutation.isPending ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </span>
              ) : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
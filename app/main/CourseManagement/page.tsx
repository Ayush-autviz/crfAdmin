'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Edit, Trash } from 'lucide-react';
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
    onError: (error) => {
      toast('Error', {
        description: 'Failed to create course. Please try again.',
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
    onError: (error) => {
      toast('Error', {
        description: 'Failed to delete course. Please try again.',
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  const handleCreateCourse = (): void => {
    if (!newCourseTitle) {
      toast('Missing Information', {
        description: 'Please fill in the required title field.',
        style: { background: '#ef4444', color: 'white' },
      });
      return;
    }

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
                  className="bg-[#334155] border-0 mt-2 placeholder:text-white"
                />
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
                  className="bg-[#334155] border-0 mt-2 text-white placeholder:text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="bg-[#334155] border-0 mt-2 text-white"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="max-w-[200px] max-h-[200px] object-contain rounded-md"
                    />
                  </div>
                )}
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
                {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
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
            <div className="text-2xl text-[#F6BE00] font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#162033] shadow-lg">
          <CardHeader className="">
            <CardTitle className="text-2xl text-white font-bold">
              Total Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#F6BE00] font-bold">
              {courses.reduce((total, course) => total + course.video_count, 0)}
            </div>
          </CardContent>
        </Card>
        {/* <Card className="bg-[#162033] shadow-lg">
          <CardHeader className="">
            <CardTitle className="text-2xl text-white font-bold">
              Total Content Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#F6BE00] font-bold">10h 30m</div>
          </CardContent>
        </Card> */}
      </div>

      <Card className="bg-[#162033] shadow-lg">
        <CardHeader>
          <CardTitle className='text-2xl text-white font-bold'>Course Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#334155]">
                <TableHead className="text-white">Title</TableHead>
                {/* <TableHead className="text-white">Category</TableHead>
                <TableHead className="text-white">Level</TableHead>
                <TableHead className="text-white">Duration</TableHead> */}
                <TableHead className="text-white">Lectures</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-[#334155]">
                  <TableCell className="font-medium text-white">{course.title}</TableCell>
                   {/* <TableCell className='text-white'>{course?.category}</TableCell>
                  <TableCell className='text-white'>{course?.level}</TableCell>
                  <TableCell className='text-white'>{course?.duration}</TableCell> */}
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
              {deleteCourseMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
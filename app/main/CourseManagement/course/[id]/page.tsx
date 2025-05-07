'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash, Upload, FileVideo, ArrowLeft } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addVideoToCourse, deleteVideo, fetchCourseById, fetchCourseLectures, updateCourse } from '@/lib/ApiService';

interface Lecture {
  id: string;
  title: string;
  duration: string;
  videoUrl: string | null;
  description: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
}

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourseById(id),
  });

  const { data: lectures, isLoading, error } = useQuery({
    queryKey: ['courseLectures', id],
    queryFn: () => fetchCourseLectures(id!),
    enabled: !!id,
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState(course?.title || '');
  const [editedDescription, setEditedDescription] = useState(course?.description || '');
  const [editedThumbnail, setEditedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course?.thumbnail || null);
  const [isLectureDialogOpen, setIsLectureDialogOpen] = useState<boolean>(false);
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureDescription, setNewLectureDescription] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [lectureThumbnailFile, setLectureThumbnailFile] = useState<File | null>(null);
  const [lectureThumbnailPreview, setLectureThumbnailPreview] = useState<string | null>(null);

  const updateCourseMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: (updatedCourse: Course) => {
      queryClient.setQueryData(['course', id], updatedCourse);
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      setIsEditing(false);
      toast.success('Changes Saved', {
        description: 'Your course details have been updated.',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'Failed to update course. Please try again.',
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  // Update thumbnail previews
  useEffect(() => {
    if (editedThumbnail) {
      const objectUrl = URL.createObjectURL(editedThumbnail);
      setThumbnailPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setThumbnailPreview(course?.thumbnail || null);
    }
  }, [editedThumbnail, course?.thumbnail]);

  useEffect(() => {
    if (lectureThumbnailFile) {
      const objectUrl = URL.createObjectURL(lectureThumbnailFile);
      setLectureThumbnailPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLectureThumbnailPreview(null);
    }
  }, [lectureThumbnailFile]);

  // Update initial form values when course data loads
  useEffect(() => {
    if (course) {
      setEditedTitle(course.title);
      setEditedDescription(course.description);
      setThumbnailPreview(course.thumbnail || null);
    }
  }, [course]);

  const addVideoMutation = useMutation({
    mutationFn: addVideoToCourse,
    onSuccess: (data) => {
      const newLecture: Lecture = {
        id: `${course?.id}-${(lectures?.length || 0) + 1}`,
        title: newLectureTitle,
        duration: '0m',
        videoUrl: data.videoUrl || 'video-url.mp4',
        description: newLectureDescription,
      };

      setIsLectureDialogOpen(false);
      setNewLectureTitle('');
      setNewLectureDescription('');
      setVideoFile(null);
      setLectureThumbnailFile(null);

      toast.success('Lecture Added', {
        description: 'The new lecture has been added to the course.',
      });

      queryClient.invalidateQueries({ queryKey: ['courseLectures', id] });
    },
    onError: () => {
      toast.error('Error', {
        description: 'Failed to add lecture. Please try again.',
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseLectures', id] });
      toast.success('Lecture Deleted', {
        description: 'The lecture has been removed from the course.',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'Failed to delete lecture. Please try again.',
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  if (isLoading || courseLoading) {
    return <div>Loading course data...</div>;
  }

  if (error || courseError || !course?.id) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-[#A4A4A4] mb-6">
          {error || courseError ? 'Failed to load course data.' : 'The course you are looking for does not exist.'}
        </p>
        <Button onClick={() => router.push('/admin')}>Back to Dashboard</Button>
      </div>
    );
  }


  
  const handleSaveChanges = () => {
    if (!editedTitle) {
      toast.error('Missing Information', {
        description: 'Course title is required.',
        style: { background: '#ef4444', color: 'white' },
      });
      return;
    }
    updateCourseMutation.mutate({
      courseId: id,
      title: editedTitle,
      description: editedDescription,
      thumbnail: editedThumbnail,
    });

  };

  // const handleSaveChanges = () => {
  //   // Here you would typically call an API to update the course
  //   // For now, we'll just update the local state
  //   setIsEditing(false);
  //   toast.success('Changes Saved', {
  //     description: 'Your course details have been updated.',
  //   });

  //   // In a real app, you'd make an API call here to update the course
  //   // and then invalidate the course query
  //   queryClient.invalidateQueries({ queryKey: ['course', id] });
  // };

  const handleCreateLecture = () => {
    if (!newLectureTitle || !videoFile || !lectureThumbnailFile) {
      toast.error('Missing Information', {
        description: 'Please fill in all required fields (title, video file, and thumbnail).',
        style: { background: '#ef4444', color: 'white' },
      });
      return;
    }

    addVideoMutation.mutate({
      courseId: course.id,
      title: newLectureTitle,
      file: videoFile,
      thumbnail: lectureThumbnailFile,
      file_size: videoFile.size,
    });
  };

  const handleDeleteLecture = (lectureId: string) => {
    const lecture = lectures?.find((lecture) => lecture.id === lectureId);
    if (lecture && lecture.videoUrl) {
      deleteVideoMutation.mutate(lectureId);
    }
  };

  const handleEditLecture = (lectureId: string) => {
    router.push(`/main/CourseManagement/course/${course.id}/lecture/${lectureId}`);
  };

  console.log(course,'courseee')

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 text-[#F6BE00] hover:text-black"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Card className="bg-[#1A1F2C] border-[#323D50] shadow-lg mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white font-bold mb-2">Course Details</CardTitle>
            {!isEditing ? (
              <Button
                className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
            ) : (
              <div className="space-x-2">
                <Button
                  className="bg-white hover:bg-white text-black"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTitle(course.title);
                    setEditedDescription(course.description);
                    setEditedThumbnail(null);
                    setThumbnailPreview(course.thumbnail || null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl text-white font-bold mb-2">{course.title}</h2>
                <p className="text-sm text-[#A4A4A4]">{course.description}</p>
              </div>
              {course.thumbnail_url && (
                <div>
                  <p className="text-sm text-[#F6BE00] mb-2">Course Thumbnail</p>
                  <img
                    src={course.thumbnail_url}
                    alt="Course thumbnail"
                    className="max-w-[200px] max-h-[200px] object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-white" htmlFor="title">
                  Course Title
                </Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-[#334155] border-0 text-white placeholder:text-white mt-4"
                />
              </div>
              <div>
                <Label className="text-white" htmlFor="description">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="bg-[#334155] border-0 text-white placeholder:text-white mt-4"
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-white" htmlFor="thumbnail">
                  Course Thumbnail
                </Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditedThumbnail(e.target.files?.[0] || null)
                  }
                  className="bg-[#334155] border-0 mt-4 text-white"
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
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#1A1F2C] border-[#323D50] shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white font-bold mb-2">Course Lectures</CardTitle>
            <Dialog open={isLectureDialogOpen} onOpenChange={setIsLectureDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]">
                  <Plus className="h-4 w-4 mr-2" /> Add Lecture
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50]">
                <DialogHeader className="mt-3">
                  <DialogTitle>Add New Lecture</DialogTitle>
                  <DialogDescription className="text-[#A4A4A4]">
                    Create a new lecture for this course by uploading a video and its details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 mt-4">
                  <div>
                    <Label htmlFor="lectureTitle">Lecture Title*</Label>
                    <Input
                      id="lectureTitle"
                      value={newLectureTitle}
                      onChange={(e) => setNewLectureTitle(e.target.value)}
                      placeholder="Enter lecture title"
                      className="bg-[#334155] border-0 mt-4 placeholder:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lectureDescription">Description</Label>
                    <Textarea
                      id="lectureDescription"
                      value={newLectureDescription}
                      onChange={(e) => setNewLectureDescription(e.target.value)}
                      placeholder="Enter lecture description"
                      className="bg-[#334155] border-0 mt-4 placeholder:text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoFile">Video File*</Label>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/mp4"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                      className="bg-[#334155] border-0 mt-4 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail*</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLectureThumbnailFile(e.target.files?.[0] || null)
                      }
                      className="bg-[#334155] border-0 mt-4 text-white"
                    />
                    {lectureThumbnailPreview && (
                      <div className="mt-2">
                        <img
                          src={lectureThumbnailPreview}
                          alt="Thumbnail preview"
                          className="max-w-[200px] max-h-[200px] object-contain rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-white hover:bg-white text-black"
                    onClick={() => setIsLectureDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                    onClick={handleCreateLecture}
                    disabled={addVideoMutation.isPending}
                  >
                    {addVideoMutation.isPending ? 'Adding...' : 'Add Lecture'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {lectures?.length === 0 ? (
            <div className="text-center py-8">
              <FileVideo className="h-12 w-12 mx-auto text-[#A4A4A4] mb-4" />
              <h3 className="text-lg font-medium mb-2">No Lectures Yet</h3>
              <p className="text-[#A4A4A4] mb-4">Start building your course by adding the first lecture.</p>
              <Button
                className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
                onClick={() => setIsLectureDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add First Lecture
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#334155]">
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Duration</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lectures?.map((lecture) => (
                  <TableRow key={lecture.id} className="hover:bg-[#334155]">
                    <TableCell className="font-medium text-white">{lecture.title}</TableCell>
                    <TableCell className="text-white">{lecture.duration}</TableCell>
                    <TableCell>
                      {lecture.videoUrl ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Video Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                          No Video
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditLecture(lecture.id)}
                      >
                        {lecture.videoUrl ? (
                          <Edit color="#FFC107" className="h-4 w-4" />
                        ) : (
                          <Upload color="#FFC107" className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLecture(lecture.id)}
                        disabled={deleteVideoMutation.isPending}
                      >
                        <Trash color="#FFC107" className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
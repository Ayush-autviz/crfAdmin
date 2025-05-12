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
import { Plus, Edit, Trash, Upload, FileVideo, ArrowLeft, Play, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addVideoToCourse, deleteVideo, fetchCourseById, fetchCourseLectures, updateCourse, updateVideo } from '@/lib/ApiService';
import {
  updateCourseSchema,
  addLectureSchema,
  updateLectureSchema,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES
} from '@/lib/validations';
import { validateForm, validateFileUpload } from '@/lib/validateForm';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoModal } from '@/components/VideoModal';

interface Lecture {
  id: string;
  title: string;
  description: string;
  duration?: string;
  videoUrl?: string | null;
  stream_url?: string;
  thumbnail_url?: string;
  created_at?: string;
  file_size?: number;
  mime_type?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  thumbnail_url?: string;
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
  const [isEditLectureDialogOpen, setIsEditLectureDialogOpen] = useState<boolean>(false);
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureDescription, setNewLectureDescription] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [lectureThumbnailFile, setLectureThumbnailFile] = useState<File | null>(null);
  const [lectureThumbnailPreview, setLectureThumbnailPreview] = useState<string | null>(null);

  // Edit lecture state
  const [editLectureId, setEditLectureId] = useState<string>('');
  const [editLectureTitle, setEditLectureTitle] = useState('');
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);

  // Video modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ streamUrl: string; title: string } | null>(null);

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
    onError: (error: any) => {
      console.error("Update course failed:", error);

      // Default error message
      let errorMessage = "Failed to update course. Please try again.";

      // Use error.response.data.error for the toast description if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      toast.error('Error', {
        description: errorMessage,
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
    } else if (course?.thumbnail_url) {
      // Use the thumbnail_url from the course if available
      setThumbnailPreview(course.thumbnail_url);
    } else {
      setThumbnailPreview(course?.thumbnail || null);
    }
  }, [editedThumbnail, course?.thumbnail, course?.thumbnail_url]);

  useEffect(() => {
    if (lectureThumbnailFile) {
      const objectUrl = URL.createObjectURL(lectureThumbnailFile);
      setLectureThumbnailPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLectureThumbnailPreview(null);
    }
  }, [lectureThumbnailFile]);

  // Update edit lecture thumbnail preview
  useEffect(() => {
    if (editThumbnailFile) {
      const objectUrl = URL.createObjectURL(editThumbnailFile);
      setEditThumbnailPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [editThumbnailFile]);

  // Update initial form values when course data loads
  useEffect(() => {
    if (course) {
      setEditedTitle(course.title);
      setEditedDescription(course.description);
      // Use thumbnail_url if available, otherwise fall back to thumbnail
      setThumbnailPreview(course.thumbnail_url || course.thumbnail || null);
    }
  }, [course]);

  const addVideoMutation = useMutation({
    mutationFn: addVideoToCourse,
    onSuccess: () => {
      // Successfully added the lecture

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
    onError: (error: any) => {
      console.error("Add lecture failed:", error);

      // Default error message
      let errorMessage = "Failed to add lecture. Please try again.";

      // Use error.response.data.error for the toast description if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      toast.error('Error', {
        description: errorMessage,
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
    onError: (error: any) => {
      console.error("Delete lecture failed:", error);

      // Default error message
      let errorMessage = "Failed to delete lecture. Please try again.";

      // Use error.response.data.error for the toast description if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      toast.error('Error', {
        description: errorMessage,
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: updateVideo,
    onSuccess: () => {
      setIsEditLectureDialogOpen(false);
      setEditLectureId('');
      setEditLectureTitle('');
      setEditVideoFile(null);
      setEditThumbnailFile(null);
      setEditThumbnailPreview(null);

      toast.success('Lecture Updated', {
        description: 'The lecture has been successfully updated.',
      });

      queryClient.invalidateQueries({ queryKey: ['courseLectures', id] });
    },
    onError: (error: any) => {
      console.error("Update lecture failed:", error);

      // Default error message
      let errorMessage = "Failed to update lecture. Please try again.";

      // Use error.response.data.error for the toast description if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      toast.error('Error', {
        description: errorMessage,
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  if (isLoading || courseLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Skeleton className="h-10 w-10 rounded-full bg-[#334155]" />
        </div>

        <Card className="bg-[#1A1F2C] border-[#323D50] shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48 bg-[#334155]" />
              <Skeleton className="h-10 w-24 bg-[#334155]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4 bg-[#334155]" />
              <Skeleton className="h-4 w-full bg-[#334155]" />
              <Skeleton className="h-4 w-full bg-[#334155]" />
              <Skeleton className="h-32 w-48 bg-[#334155]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F2C] border-[#323D50] shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48 bg-[#334155]" />
              <Skeleton className="h-10 w-32 bg-[#334155]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-[#323D50]">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48 bg-[#334155]" />
                    <Skeleton className="h-4 w-24 bg-[#334155]" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md bg-[#334155]" />
                    <Skeleton className="h-8 w-8 rounded-md bg-[#334155]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || courseError || !course?.id) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-[#A4A4A4] mb-6">
          {error || courseError ? 'Failed to load course data.' : 'The course you are looking for does not exist.'}
        </p>
        <div className="flex space-x-4">
          <Button onClick={() => router.push('/main/CourseManagement')}>
            Back to Courses
          </Button>
          {(error || courseError) && (
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['course', id] });
                queryClient.invalidateQueries({ queryKey: ['courseLectures', id] });
              }}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }



  const handleSaveChanges = () => {
    // Validate file first if there is one
    if (editedThumbnail) {
      const fileValidation = validateFileUpload(editedThumbnail, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
      if (!fileValidation.valid) {
        toast.error('File Error', {
          description: fileValidation.error,
        });
        return;
      }
    }

    // Validate form data
    const validation = validateForm(updateCourseSchema, {
      courseId: id,
      title: editedTitle,
      description: editedDescription,
      thumbnail: editedThumbnail,
    });

    if (!validation.success) {
      return; // Errors are already shown as toasts by validateForm
    }

    // Submit the form if validation passes
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
    // Validate video file
    if (videoFile) {
      const videoValidation = validateFileUpload(videoFile, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES);
      if (!videoValidation.valid) {
        toast.error('Video File Error', {
          description: videoValidation.error,
        });
        return;
      }
    }

    // Validate thumbnail file
    if (lectureThumbnailFile) {
      const thumbnailValidation = validateFileUpload(lectureThumbnailFile, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
      if (!thumbnailValidation.valid) {
        toast.error('Thumbnail Error', {
          description: thumbnailValidation.error,
        });
        return;
      }
    }

    // Validate form data
    const validation = validateForm(addLectureSchema, {
      courseId: course.id,
      title: newLectureTitle,
      description: '',
      file: videoFile,
      thumbnail: lectureThumbnailFile,
      file_size: videoFile?.size,
    });

    if (!validation.success) {
      return; // Errors are already shown as toasts by validateForm
    }

    // Submit the form if validation passes
    addVideoMutation.mutate({
      courseId: course.id,
      title: newLectureTitle,
      file: videoFile!,
      thumbnail: lectureThumbnailFile!,
      file_size: videoFile!.size,
    });
  };

  const handleDeleteLecture = (lectureId: string) => {
    const lecture = lectures?.find((lecture) => lecture.id === lectureId);
    if (lecture && (lecture.videoUrl || lecture.stream_url)) {
      deleteVideoMutation.mutate(lectureId);
    }
  };

  const handleEditLecture = (lectureId: string) => {
    const lecture = lectures?.find((lecture) => lecture.id === lectureId);
    if (lecture) {
      setEditLectureId(lectureId);
      setEditLectureTitle(lecture.title);
      setEditThumbnailPreview(lecture.thumbnail_url || null);
      setIsEditLectureDialogOpen(true);
    }
  };

  const handleUpdateLecture = () => {
    // Validate video file if provided
    if (editVideoFile) {
      const videoValidation = validateFileUpload(editVideoFile, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES);
      if (!videoValidation.valid) {
        toast.error('Video File Error', {
          description: videoValidation.error,
        });
        return;
      }
    }

    // Validate thumbnail file if provided
    if (editThumbnailFile) {
      const thumbnailValidation = validateFileUpload(editThumbnailFile, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
      if (!thumbnailValidation.valid) {
        toast.error('Thumbnail Error', {
          description: thumbnailValidation.error,
        });
        return;
      }
    }

    // Prepare update data
    const updateData: {
      videoId: string;
      title: string;
      file?: File;
      thumbnail?: File;
      file_size?: number;
    } = {
      videoId: editLectureId,
      title: editLectureTitle,
    };

    // Add optional fields only if they exist
    if (editVideoFile) {
      updateData.file = editVideoFile;
      updateData.file_size = editVideoFile.size;
    }

    if (editThumbnailFile) {
      updateData.thumbnail = editThumbnailFile;
    }

    // Validate form data
    const validation = validateForm(updateLectureSchema, updateData);

    if (!validation.success) {
      return; // Errors are already shown as toasts by validateForm
    }

    // Submit the form if validation passes
    updateVideoMutation.mutate(updateData);
  };



  // Function to handle playing a video
  const handlePlayVideo = (streamUrl: string, title: string) => {
    setSelectedVideo({ streamUrl, title });
    setIsVideoModalOpen(true);
  };

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 text-[#F6BE00] hover:text-black"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          streamUrl={selectedVideo.streamUrl}
          title={selectedVideo.title}
        />
      )}

      {/* Edit Lecture Dialog */}
      <Dialog open={isEditLectureDialogOpen} onOpenChange={setIsEditLectureDialogOpen}>
        <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-bold">Edit Lecture</DialogTitle>
            <DialogDescription className="text-[#A4A4A4] text-sm">
              Update the lecture details and content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-white">
                Lecture Title
              </Label>
              <Input
                id="edit-title"
                placeholder="Enter lecture title"
                value={editLectureTitle}
                onChange={(e) => setEditLectureTitle(e.target.value)}
                className="bg-[#0F1623] border-[#323D50] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-video" className="text-white">
                Video File (Optional)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="edit-video-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#323D50] border-dashed rounded-lg cursor-pointer bg-[#0F1623] hover:bg-[#1F2A3C] transition-colors"
                >
                  {editVideoFile ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileVideo className="w-8 h-8 mb-3 text-green-500" />
                      <p className="mb-2 text-sm text-white">
                        <span className="font-semibold">{editVideoFile.name}</span>
                      </p>
                      <p className="text-xs text-[#A4A4A4]">
                        {(editVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileVideo className="w-8 h-8 mb-3 text-[#A4A4A4]" />
                      <p className="mb-2 text-sm text-[#A4A4A4]">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-[#A4A4A4]">MP4, WebM or OGG (MAX. 500MB)</p>
                    </div>
                  )}
                  <input
                    id="edit-video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const validation = validateFileUpload(file, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES);
                        if (!validation.valid) {
                          toast.error('Video File Error', {
                            description: validation.error,
                          });
                          e.target.value = '';
                          return;
                        }
                        setEditVideoFile(file);
                      }
                    }}
                  />
                </label>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-thumbnail" className="text-white">
                Thumbnail Image (Optional)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="edit-thumbnail-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#323D50] border-dashed rounded-lg cursor-pointer bg-[#0F1623] hover:bg-[#1F2A3C] transition-colors"
                >
                  {editThumbnailPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={editThumbnailPreview}
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
                    id="edit-thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const validation = validateFileUpload(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
                        if (!validation.valid) {
                          toast.error('Thumbnail Error', {
                            description: validation.error,
                          });
                          e.target.value = '';
                          return;
                        }
                        setEditThumbnailFile(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className=" text-black"
              onClick={() => setIsEditLectureDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#F6BE00] to-[#F6BE00]/80 hover:from-[#F6BE00]/90 hover:to-[#F6BE00]/70 text-black font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-[#F6BE00]/20"
              onClick={handleUpdateLecture}
              disabled={updateVideoMutation.isPending}
            >
              {updateVideoMutation.isPending ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-black"
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
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Edit className="h-5 w-5 mr-2" /> Update Lecture
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <div className="w-full max-w-[300px] h-[180px] border-2 border-[#323D50] rounded-lg overflow-hidden">
                    <div className="relative w-full h-full">
                      <img
                        src={course.thumbnail_url}
                        alt="Course thumbnail"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  </div>
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
                <div className="flex items-center justify-center w-[250px] mt-4">
                  <label
                    htmlFor="thumbnail"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#323D50] border-dashed rounded-lg cursor-pointer bg-[#0F1623] hover:bg-[#1F2A3C] transition-colors"
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
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const validation = validateFileUpload(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
                          if (!validation.valid) {
                            toast.error('File Error', {
                              description: validation.error,
                            });
                            e.target.value = '';
                            return;
                          }
                        }
                        setEditedThumbnail(file);
                      }}
                    />
                  </label>
                </div>
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
                    <div className="flex items-center justify-center w-full mt-4">
                      <label
                        htmlFor="videoFile"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#323D50] border-dashed rounded-lg cursor-pointer bg-[#0F1623] hover:bg-[#1F2A3C] transition-colors"
                      >
                        {videoFile ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileVideo className="w-8 h-8 mb-3 text-green-500" />
                            <p className="mb-2 text-sm text-white">
                              <span className="font-semibold">{videoFile.name}</span>
                            </p>
                            <p className="text-xs text-[#A4A4A4]">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileVideo className="w-8 h-8 mb-3 text-[#A4A4A4]" />
                            <p className="mb-2 text-sm text-[#A4A4A4]">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[#A4A4A4]">MP4, WebM or OGG (MAX. 500MB)</p>
                          </div>
                        )}
                        <input
                          id="videoFile"
                          type="file"
                          accept="video/mp4"
                          className="hidden"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const validation = validateFileUpload(file, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES);
                              if (!validation.valid) {
                                toast.error('Video File Error', {
                                  description: validation.error,
                                });
                                e.target.value = '';
                                return;
                              }
                            }
                            setVideoFile(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lectureThumbnail">Thumbnail*</Label>
                    <div className="flex items-center justify-center w-full mt-4">
                      <label
                        htmlFor="lectureThumbnail"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#323D50] border-dashed rounded-lg cursor-pointer bg-[#0F1623] hover:bg-[#1F2A3C] transition-colors"
                      >
                        {lectureThumbnailPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={lectureThumbnailPreview}
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
                          id="lectureThumbnail"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const validation = validateFileUpload(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES);
                              if (!validation.valid) {
                                toast.error('Thumbnail Error', {
                                  description: validation.error,
                                });
                                e.target.value = '';
                                return;
                              }
                            }
                            setLectureThumbnailFile(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className=" text-black"
                    onClick={() => setIsLectureDialogOpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#F6BE00] to-[#F6BE00]/80 hover:from-[#F6BE00]/90 hover:to-[#F6BE00]/70 text-black font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-[#F6BE00]/20"
                    onClick={handleCreateLecture}
                    disabled={addVideoMutation.isPending}
                  >
                    {addVideoMutation.isPending ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-black"
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
                        Adding Lecture...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Plus className="h-5 w-5 mr-2" /> Add Lecture
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-[#323D50]">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48 bg-[#334155]" />
                    <Skeleton className="h-4 w-24 bg-[#334155]" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md bg-[#334155]" />
                    <Skeleton className="h-8 w-8 rounded-md bg-[#334155]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to load lectures</h3>
              <p className="text-[#A4A4A4] mb-4">There was a problem loading the course lectures.</p>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['courseLectures', id] })}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : lectures?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-[#1F2A3C] p-8 rounded-xl border border-[#323D50] shadow-lg max-w-md w-full">
                <div className="bg-[#F6BE00]/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <FileVideo className="h-10 w-10 text-[#F6BE00]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 text-center">No Lectures Yet</h3>
                <p className="text-[#A4A4A4] mb-6 text-center">
                  Start building your course by adding your first lecture. Lectures help organize your course content.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-[#F6BE00] to-[#F6BE00]/80 hover:from-[#F6BE00]/90 hover:to-[#F6BE00]/70 text-black font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-[#F6BE00]/20"
                  onClick={() => setIsLectureDialogOpen(true)}
                >
                  <Plus className="h-5 w-5 mr-2" /> Add Your First Lecture
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#334155]">
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lectures?.map((lecture) => (
                  <TableRow key={lecture.id} className="hover:bg-[#334155]">
                    <TableCell className="font-medium text-white">{lecture.title}</TableCell>
                    <TableCell>
                      {(lecture.videoUrl || lecture.stream_url) ? (
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
                      {(lecture.videoUrl || lecture.stream_url) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayVideo(lecture.stream_url || lecture.videoUrl || '', lecture.title)}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditLecture(lecture.id)}
                      >
                        {(lecture.videoUrl || lecture.stream_url) ? (
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
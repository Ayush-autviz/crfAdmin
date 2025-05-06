'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash, Upload, FileVideo, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  category: string;
  level: string;
  instructor: string;
  lectures: Lecture[];
}

// Dummy data for courses
const coursesData: Course[] = [
  {
    id: "1",
    title: "Advanced Price Action Mastery",
    description: "Master the art of price action trading with advanced techniques and strategies.",
    category: "Trading",
    level: "Advanced",
    instructor: "John Smith",
    lectures: [
      { id: "1-1", title: "Introduction to Price Action", duration: "15m", videoUrl: null, description: "An overview of price action trading." },
      { id: "1-2", title: "Candlestick Patterns", duration: "45m", videoUrl: "video-url.mp4", description: "Understanding candlestick patterns." },
      { id: "1-3", title: "Support and Resistance Levels", duration: "1h", videoUrl: "video-url.mp4", description: "Identifying key price levels." },
    ]
  },
  {
    id: "2",
    title: "Risk Management Fundamentals",
    description: "Learn essential risk management strategies to protect your capital.",
    category: "Investing",
    level: "Beginner",
    instructor: "Sarah Johnson",
    lectures: [
      { id: "2-1", title: "Understanding Risk", duration: "20m", videoUrl: null, description: "Introduction to risk in trading and investing." },
      { id: "2-2", title: "Position Sizing", duration: "35m", videoUrl: "video-url.mp4", description: "How to properly size positions." },
    ]
  },
  {
    id: "3",
    title: "Trading Psychology Master",
    description: "Develop the mindset of successful traders and overcome psychological hurdles.",
    category: "Trading",
    level: "Intermediate",
    instructor: "Mike Anderson",
    lectures: [
      { id: "3-1", title: "Trading Mindset", duration: "25m", videoUrl: null, description: "Developing a successful trading mindset." },
      { id: "3-2", title: "Overcoming Fear", duration: "40m", videoUrl: "video-url.mp4", description: "Strategies to overcome fear in trading." },
      { id: "3-3", title: "Managing Greed", duration: "30m", videoUrl: "video-url.mp4", description: "How to control greed in your trading." },
    ]
  }
];

// API function to add video to course
const addVideoToCourse = async (videoData: {
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

  const response = await fetch(
    `http://localhost:5000/api/admin/courses/${videoData.courseId}/videos`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <YOUR_JWT_TOKEN>', // Replace with actual token
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to add video');
  }

  return response.json();
};

// API function to delete a video
const deleteVideo = async (videoId: string) => {
  const response = await fetch(`http://localhost:5000/api/admin/videos/${videoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer <YOUR_JWT_TOKEN>', // Replace with actual token
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete video');
  }

  return response.json();
};

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const courseData = coursesData.find(course => course.id === id);
  
  const [course, setCourse] = useState<Course>(courseData || {
    id: "",
    title: "",
    description: "",
    category: "",
    level: "",
    instructor: "",
    lectures: [],
  });
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(course.title);
  const [editedDescription, setEditedDescription] = useState<string>(course.description);
  const [isLectureDialogOpen, setIsLectureDialogOpen] = useState<boolean>(false);
  const [newLectureTitle, setNewLectureTitle] = useState<string>("");
  const [newLectureDescription, setNewLectureDescription] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

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

  const addVideoMutation = useMutation({
    mutationFn: addVideoToCourse,
    onSuccess: (data) => {
      const newLecture: Lecture = {
        id: `${course.id}-${course.lectures.length + 1}`,
        title: newLectureTitle,
        duration: "0m", // Duration could be updated based on API response if available
        videoUrl: data.videoUrl || "video-url.mp4", // Adjust based on actual API response
        description: newLectureDescription,
      };

      setCourse({
        ...course,
        lectures: [...course.lectures, newLecture],
      });

      setIsLectureDialogOpen(false);
      setNewLectureTitle("");
      setNewLectureDescription("");
      setVideoFile(null);
      setThumbnailFile(null);

      toast.success("Lecture Added", {
        description: "The new lecture has been added to the course.",
      });

      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      toast.error("Error", {
        description: "Failed to add lecture. Please try again.",
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      toast.error("Error", {
        description: "Failed to delete lecture. Please try again.",
        style: { background: '#ef4444', color: 'white' },
      });
    },
  });
  
  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-[#A4A4A4] mb-6">The course you are looking for does not exist.</p>
        <Button onClick={() => router.push("/admin")}>Back to Dashboard</Button>
      </div>
    );
  }
  
  const handleSaveChanges = () => {
    setCourse({
      ...course,
      title: editedTitle,
      description: editedDescription,
    });
    
    setIsEditing(false);
    toast.success("Changes Saved", {
      description: "Your course details have been updated.",
    });
  };
  
  const handleCreateLecture = () => {
    if (!newLectureTitle || !videoFile || !thumbnailFile) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields (title, video file, and thumbnail).",
        style: { background: '#ef4444', color: 'white' },
      });
      return;
    }
    
    addVideoMutation.mutate({
      courseId: course.id,
      title: newLectureTitle,
      file: videoFile,
      thumbnail: thumbnailFile,
      file_size: videoFile.size,
    });
  };
  
  const handleDeleteLecture = (lectureId: string) => {
    const lecture = course.lectures.find(lecture => lecture.id === lectureId);
    if (lecture && lecture.videoUrl) {
      deleteVideoMutation.mutate(lectureId);
    }
    
    setCourse({
      ...course,
      lectures: course.lectures.filter(lecture => lecture.id !== lectureId),
    });
    
    toast.success("Lecture Deleted", {
      description: "The lecture has been removed from the course.",
    });
  };
  
  const handleEditLecture = (lectureId: string) => {
    router.push(`/main/CourseManagement/course/${course.id}/lecture/${lectureId}`);
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-[#F6BE00]">Category</p>
                  <p className="text-sm text-white mt-2">{course.category}</p>
                </div>
                <div>
                  <p className="text-sm text-[#F6BE00]">Level</p>
                  <p className="text-sm text-white mt-2">{course.level}</p>
                </div>
                <div>
                  <p className="text-sm text-[#F6BE00]">Instructor</p>
                  <p className="text-sm text-white mt-2">{course.instructor}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-white" htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-[#334155] border-0 text-white placeholder:text-white mt-4"
                />
              </div>
              <div>
                <Label className="text-white" htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="bg-[#334155] border-0 text-white placeholder:text-white mt-4"
                  rows={4}
                />
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
                        setThumbnailFile(e.target.files?.[0] || null)
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
          {course.lectures.length === 0 ? (
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
                {course.lectures.map((lecture) => (
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
                          <Edit color='#FFC107' className="h-4 w-4" />
                        ) : (
                          <Upload color='#FFC107' className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLecture(lecture.id)}
                        disabled={deleteVideoMutation.isPending}
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
    </div>
  );
}
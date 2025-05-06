"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileVideo, X, ArrowLeft } from "lucide-react";

// Dummy data for lectures (same as in CourseEditor)
const coursesData = [
  {
    id: "1",
    title: "Advanced Price Action Mastery",
    lectures: [
      { id: "1-1", title: "Introduction to Price Action", duration: "15m", videoUrl: null, description: "An overview of price action trading." },
      { id: "1-2", title: "Candlestick Patterns", duration: "45m", videoUrl: "video-url.mp4", description: "Understanding candlestick patterns." },
      { id: "1-3", title: "Support and Resistance Levels", duration: "1h", videoUrl: "video-url.mp4", description: "Identifying key price levels." },
    ]
  },
  {
    id: "2",
    title: "Risk Management Fundamentals",
    lectures: [
      { id: "2-1", title: "Understanding Risk", duration: "20m", videoUrl: null, description: "Introduction to risk in trading and investing." },
      { id: "2-2", title: "Position Sizing", duration: "35m", videoUrl: "video-url.mp4", description: "How to properly size positions." },
    ]
  },
  {
    id: "3",
    title: "Trading Psychology Master",
    lectures: [
      { id: "3-1", title: "Trading Mindset", duration: "25m", videoUrl: null, description: "Developing a successful trading mindset." },
      { id: "3-2", title: "Overcoming Fear", duration: "40m", videoUrl: "video-url.mp4", description: "Strategies to overcome fear in trading." },
      { id: "3-3", title: "Managing Greed", duration: "30m", videoUrl: "video-url.mp4", description: "How to control greed in your trading." },
    ]
  }
];

interface LectureUploadProps {
  courseId?: string;
  lectureId?: string;
}

export default function LectureUpload() {
  const router = useRouter();
  const { id:courseId, lecture:lectureId } = useParams<{ id:string, lecture:string }>();
  
  const courseData = coursesData.find(course => course.id === courseId);
  const lectureData = courseData?.lectures.find(lecture => lecture.id === lectureId);
  
  const [lecture, setLecture] = useState(lectureData || {
    id: "",
    title: "",
    duration: "",
    videoUrl: null,
    description: "",
  });
  
  const [title, setTitle] = useState(lecture.title);
  const [description, setDescription] = useState(lecture.description);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  if (!lectureData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Lecture Not Found</h1>
        <p className="text-[#A4A4A4] mb-6">The lecture you are looking for does not exist.</p>
        <Button onClick={() => router.push(`/admin/course/${courseId}`)}>Back to Course</Button>
      </div>
    );
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  
  const handleClearVideo = () => {
    setVideoFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  const handleUpload = () => {
    if (!videoFile) {
      toast.error("Please select a video file to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          toast.success("Video uploaded successfully");
          
          // Update lecture with new data
          setLecture({
            ...lecture,
            title,
            description,
            videoUrl: "uploaded-video-url.mp4",
            duration: "30m", // Just a placeholder
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };
  
  const handleSave = () => {
    // Save the lecture details
    setLecture({
      ...lecture,
      title,
      description,
    });
    
    toast.success("Lecture details saved successfully");
    
    // Navigate back to course editor
    router.push(`/admin/course/${courseId}`);
  };

  return (
    <div className="mb-8">
      {/* <Button 
        variant="outline" 
        onClick={() => router.push(`/admin/course/${courseId}`)}
        className="mb-4"
      >
        Back to Course
      </Button> */}
         <Button 
  variant="ghost" 
  onClick={() => router.back()}
  className="mb-4 text-[#F6BE00] hover:text-black"
>
  <ArrowLeft className="h-5 w-5" />
  </Button>
      
      <Card className="bg-[#162033]  shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-white font-bold" >Edit Lecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2" htmlFor="title">Lecture Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#334155] border-0 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-white   mb-2" htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#334155] border-0 text-white mt-1"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-[#162033]  shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-white font-bold">Video Upload</CardTitle>
        </CardHeader>
        <CardContent>
          {lecture.videoUrl || previewUrl ? (
            <div className="space-y-4">
              <div className="aspect-video bg-[#334155] rounded-md overflow-hidden">
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    controls
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileVideo className="h-16 w-16 text-[#A4A4A4]" />
                    <p className="text-[#A4A4A4] ml-2">Video file uploaded</p>
                  </div>
                )}
              </div>
              
              {!isUploading && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearVideo}
                  >
                    <X className="h-4 w-4 mr-2" /> Remove Video
                  </Button>
                  <Button
                    className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                    onClick={handleUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Replace Video
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-2 border-dashed  rounded-lg p-12 text-center">
                <FileVideo className="h-12 w-12 mx-auto text-[#A4A4A4] mb-4" />
                <h3 className="text-lg font-medium mb-2 text-white">Upload Lecture Video</h3>
                {/* <p className="text-[#A4A4A4] mb-6">Drag and drop your video file here or click to browse</p> */}
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                  <Button
                    className="bg-[#F6BE00] text-black hover:bg-[#F6BE00] mt-5"
                    type="button"
                  >
                    <Upload className="h-4 w-4 mr-2" /> Select Video
                  </Button>
              </div>
              
              <div className="text-sm text-[#A4A4A4]">
                <p>Supported formats: MP4, MOV, WEBM</p>
                <p>Maximum file size: 500MB</p>
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <div className="mt-8 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/course/${courseId}`)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
              onClick={handleSave}
              disabled={isUploading}
            >
              Save Lecture
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { X, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useAuthStore from "@/stores/authStore"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  streamUrl: string
  title: string
}

export function VideoModal({ isOpen, onClose, streamUrl, title }: VideoModalProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuthStore()

  const fetchVideo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(streamUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`)
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      setVideoSrc(blobUrl)
    } catch (err) {
      setError((err as Error).message || "Failed to load video")
      setVideoSrc(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen || !streamUrl) return

    fetchVideo()

    // Cleanup: Revoke the Blob URL when the modal closes or streamUrl changes
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc)
        setVideoSrc(null)
      }
    }
  }, [isOpen, streamUrl, token])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-5xl p-0 bg-[#1A2235] border border-[#2a3447] rounded-xl overflow-hidden shadow-2xl">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F6BE00] focus:ring-opacity-50"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="p-6">
            <DialogTitle className="text-2xl font-bold text-white mb-6 pr-8 tracking-tight">
              {isLoading ? <Skeleton className="h-8 w-3/4 bg-[#334155]" /> : title}
            </DialogTitle>

            <div className="relative rounded-xl overflow-hidden bg-black/40 shadow-inner">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-[450px] bg-[#0F1623]/80">
                  <div className="space-y-6">
                    <Skeleton className="h-[300px] w-[500px] bg-[#334155]" />
                    <div className="flex justify-center">
                      <Loader2 className="h-10 w-10 text-[#F6BE00] animate-spin" />
                    </div>
                    <p className="text-white/80 text-sm text-center">Loading video content...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center h-[450px] bg-[#0F1623]/80">
                  <div className="bg-red-500/10 p-6 rounded-lg text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400 font-medium text-lg mb-2">Error loading video</p>
                    <p className="text-[#A4A4A4] mb-4">{error}</p>
                    <Button
                      variant="outline"
                      onClick={fetchVideo}
                      className="bg-transparent border-red-500/30 hover:bg-red-500/10 text-red-400"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                    </Button>
                  </div>
                </div>
              )}

              {videoSrc && !isLoading && !error && (
                <video
                  controls
                  autoPlay
                  className="w-full h-[450px] bg-black focus:outline-none"
                  src={videoSrc}
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

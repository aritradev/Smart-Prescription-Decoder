'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string, mimeType: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop any existing stream
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err?.message || 'Could not access device camera. Please check permissions.'
      );
    } finally {
      setIsInitializing(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage, startCamera, stopCamera]);

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    // Stop video stream while previewing captured frame
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      const base64 = capturedImage.split(',')[1];
      onCapture(base64, 'image/jpeg');
      handleClose();
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-background border border-brand-teal/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-chestnut-600/20 dark:border-gray-800/80 bg-surface-100/50">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-teal" />
              <h3 className="text-base font-bold text-foreground">Capture Prescription</h3>
            </div>

            <div className="flex items-center gap-2">
              {!capturedImage && !cameraError && (
                <button
                  onClick={toggleFacingMode}
                  className="p-2 rounded-xl glass-card text-foreground/80 hover:text-foreground hover:border-brand-teal/40 transition-colors"
                  title="Flip Camera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-surface-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Camera Viewport / Preview */}
          <div className="relative flex-1 min-h-[350px] bg-black flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="p-6 text-center space-y-4 max-w-md">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-sm text-red-200">{cameraError}</p>
                <button
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:brightness-110"
                >
                  Retry Camera
                </button>
              </div>
            ) : capturedImage ? (
              /* Captured Frame Preview */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capturedImage}
                alt="Captured prescription"
                className="w-full h-full object-contain max-h-[60vh]"
              />
            ) : (
              /* Live Stream */
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover max-h-[60vh]"
                />
                
                {/* Framing Overlay Target */}
                <div className="absolute inset-8 border-2 border-dashed border-brand-teal/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/60 px-3 py-1 rounded-full text-[11px] text-gray-300 backdrop-blur-md">
                    Center prescription within frame
                  </span>
                </div>

                {isInitializing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-brand-teal text-sm gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Starting camera...</span>
                  </div>
                )}
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls Footer */}
          <div className="p-5 bg-surface-100/80 border-t border-chestnut-600/20 dark:border-gray-800/80 flex items-center justify-center gap-4">
            {capturedImage ? (
              <>
                <button
                  onClick={handleRetake}
                  className="px-5 py-2.5 rounded-xl glass-card text-foreground/80 hover:text-foreground font-medium text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-foreground/60" />
                  <span>Retake Photo</span>
                </button>

                <button
                  onClick={handleConfirm}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-emerald text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-teal/20 hover:brightness-110"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Photo</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleTakeSnapshot}
                disabled={isInitializing || !!cameraError}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-teal to-brand-emerald text-white flex items-center justify-center shadow-xl shadow-brand-teal/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 border-4 border-white/20"
                title="Shutter Button"
              >
                <div className="w-8 h-8 rounded-full bg-white/30 border border-white" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

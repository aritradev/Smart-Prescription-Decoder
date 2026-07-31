'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Camera, RefreshCw, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CameraModal from './CameraModal';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isDecoding: boolean;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadZone({ onImageSelected, isDecoding, disabled }: UploadZoneProps) {
  const { user, setShowAuthModal } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ base64: string; mimeType: string; fileName: string; isPdf: boolean } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const processFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      toast.error('Please upload a valid image (JPEG, PNG, WEBP) or PDF document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Content = result.split(',')[1];
      const mimeType = isPdf ? 'application/pdf' : file.type || 'image/jpeg';

      setPreview(isPdf ? 'pdf' : result);
      setFileMeta({
        base64: base64Content,
        mimeType,
        fileName: file.name,
        isPdf,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    [user, setShowAuthModal, processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isDecoding || disabled,
  });

  const handleClear = () => {
    setPreview(null);
    setFileMeta(null);
  };

  const handleCameraCapture = (base64: string, mimeType: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const dataUrl = `data:${mimeType};base64,${base64}`;
    setPreview(dataUrl);
    setFileMeta({
      base64,
      mimeType,
      fileName: 'Camera Capture.jpg',
      isPdf: false,
    });
  };

  const handleStartDecoding = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (fileMeta) {
      onImageSelected(fileMeta.base64, fileMeta.mimeType);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            {...getRootProps()}
            className={`relative group cursor-pointer rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 glass-panel border-2 border-dashed ${
              isDragActive
                ? 'border-brand-light bg-brand-teal/10 scale-[1.01]'
                : 'border-gray-700/80 hover:border-brand-teal/50 hover:bg-surface-100/50'
            }`}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center text-brand-teal group-hover:scale-110 group-hover:bg-brand-teal/20 transition-all duration-300 glow-teal">
                <UploadCloud className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Upload Prescription Photo or PDF
                </h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Drag & drop your handwritten medical prescription photo or PDF document. Supports JPG, PNG, WEBP, PDF up to 10MB.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*,.pdf,application/pdf';
                      input.onchange = (evt: any) => {
                        const file = evt.target.files?.[0];
                        if (file) processFile(file);
                      };
                      input.click();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal/90 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-brand-teal/20 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose Image / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      setIsCameraOpen(true);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl glass-card hover:border-brand-teal/40 text-gray-300 hover:text-white font-medium text-sm flex items-center gap-2 transition-all"
                >
                  <Camera className="w-4 h-4 text-brand-teal" />
                  <span>Use Camera</span>
                </button>
              </div>

              {!user && (
                <p className="text-xs text-amber-400/80 flex items-center justify-center gap-1.5 pt-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Sign in required before decoding</span>
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-brand-teal/30 flex flex-col items-center space-y-6"
          >
            {/* Image / PDF Container with Scan Animation */}
            <div className="relative w-full min-h-[220px] max-h-[400px] overflow-hidden rounded-2xl border border-gray-700/60 bg-black/40 flex items-center justify-center group p-4">
              {fileMeta?.isPdf ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white max-w-sm truncate">
                      {fileMeta.fileName}
                    </h4>
                    <p className="text-xs text-gray-400">PDF Document Ready for Gemini OCR</p>
                  </div>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={preview}
                  alt="Prescription preview"
                  className="max-h-[380px] w-auto object-contain rounded-xl"
                />
              )}

              {/* Scanning Overlay when decoding */}
              {isDecoding && (
                <div className="absolute inset-0 bg-brand-teal/10 backdrop-blur-[2px] flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ y: [-150, 150, -150] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-brand-light to-transparent shadow-[0_0_15px_#2dd4bf]"
                  />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 w-full pt-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={isDecoding}
                className="px-4 py-2.5 rounded-xl glass-card text-gray-300 hover:text-white hover:border-red-500/40 font-medium text-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
                <span>Change File</span>
              </button>

              <button
                type="button"
                onClick={handleStartDecoding}
                disabled={isDecoding}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-teal via-teal-600 to-brand-emerald text-white font-bold text-base flex items-center gap-2.5 shadow-xl shadow-brand-teal/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 glow-teal"
              >
                {isDecoding ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Rx...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Decode Prescription</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}

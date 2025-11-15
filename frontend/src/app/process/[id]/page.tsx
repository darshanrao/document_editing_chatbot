'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentStatus } from '@/types';

interface ProcessingStep {
  message: string;
  completed: boolean;
}

export default function ProcessingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = use(params);
  const router = useRouter();
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { message: 'Document uploaded successfully', completed: true },
    { message: 'Extracting text content...', completed: false },
    { message: 'Identifying placeholders...', completed: false },
    { message: 'Preparing chat interface...', completed: false },
  ]);

  useEffect(() => {

    let currentStep = 0;

    // Simulate processing steps
    const interval = setInterval(() => {
      currentStep++;

      if (currentStep < steps.length) {
        setSteps((prev) =>
          prev.map((step, index) =>
            index <= currentStep ? { ...step, completed: true } : step
          )
        );
      } else {
        clearInterval(interval);
        // Redirect to the filling interface
        setTimeout(() => {
          router.push(`/fill/${documentId}`);
        }, 500);
      }
    }, 1500);

    // Also poll the API to check actual processing status
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === DocumentStatus.READY) {
            clearInterval(interval);
            router.push(`/fill/${documentId}`);
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    const statusInterval = setInterval(pollStatus, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-2xl font-bold text-primary mb-8">
            ⚖️ LegalDoc Filler
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-8 border-dark-border rounded-full"></div>
            <div className="absolute inset-0 border-8 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>

          <h2 className="text-3xl font-bold text-gray-100">
            Analyzing Your Document...
          </h2>

          <p className="text-gray-400 text-center max-w-md">
            We&apos;re identifying template text and placeholders. This usually takes
            just a few seconds.
          </p>

          {/* Status Messages */}
          <div className="w-full max-w-md mt-8 bg-dark-panel border-2 border-dark-border rounded-lg p-6">
            <div className="space-y-3 font-mono text-sm">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 ${
                    step.completed ? 'text-success' : 'text-gray-500'
                  }`}
                >
                  <span className="text-lg">
                    {step.completed ? '✓' : '⏳'}
                  </span>
                  <span>{step.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

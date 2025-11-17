'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ChatPanel from '@/components/ChatPanel';
import DocumentPreview from '@/components/DocumentPreview';
import FieldListView from '@/components/FieldListView';
import ProgressBar from '@/components/ProgressBar';
import { ChatSkeleton, PreviewSkeleton, ProgressSkeleton } from '@/components/LoadingSkeleton';
import { ChatMessage, Field, FieldStatus } from '@/types';

type ViewMode = 'chat' | 'fields';

export default function FillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = use(params);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [documentContent, setDocumentContent] = useState('');
  const [documentFilename, setDocumentFilename] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Use ref for stable ID generation to avoid hydration mismatches
  const messageIdCounter = useRef(0);

  // Calculate progress
  const completedFields = fields.filter(f => f.status === FieldStatus.FILLED).length;
  const totalFields = fields.length;
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  // Fetch document data
  useEffect(() => {
    if (!documentId) return;

    const fetchDocumentData = async () => {
      try {
        const [fieldsRes, previewRes] = await Promise.all([
          fetch(`/api/documents/${documentId}/fields`),
          fetch(`/api/documents/${documentId}/preview`),
        ]);

        if (fieldsRes.ok && previewRes.ok) {
          const fieldsData = await fieldsRes.json();
          const previewData = await previewRes.json();

          setFields(fieldsData.fields);
          setDocumentContent(previewData.content);
          setDocumentFilename(fieldsData.filename || 'document.docx');

          // Get initial question
          const chatRes = await fetch(`/api/chat/${documentId}/next`);
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            // Generate stable ID and timestamp only on client side
            messageIdCounter.current = 1;
            setMessages([{
              id: `msg-${messageIdCounter.current}`,
              role: 'bot',
              content: chatData.question,
              timestamp: new Date().toISOString(),
              fieldId: chatData.fieldId,
            }]);
            setCurrentFieldId(chatData.fieldId);
          }
        }
      } catch (err) {
        console.error('Error fetching document data:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentData();
  }, [documentId]);

  // Check if all fields are completed
  useEffect(() => {
    if (totalFields > 0 && completedFields === totalFields) {
      // Redirect to completion page
      setTimeout(() => {
        router.push(`/complete/${documentId}`);
      }, 1000);
    }
  }, [completedFields, totalFields, documentId, router]);

  const handleSendMessage = async (message: string) => {
    if (!currentFieldId) return;

    // Add user message with stable ID
    messageIdCounter.current += 1;
    const userMessage: ChatMessage = {
      id: `msg-${messageIdCounter.current}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      // Submit field value
      const response = await fetch(`/api/documents/${documentId}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId: currentFieldId,
          value: message,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update fields with normalized value from backend
        if (data.updatedField) {
          setFields(prev =>
            prev.map(f =>
              f.id === data.updatedField.id
                ? { ...f, value: data.updatedField.value, status: FieldStatus.FILLED }
                : f
            )
          );

          // Refresh preview with normalized values
          const previewRes = await fetch(`/api/documents/${documentId}/preview`);
          if (previewRes.ok) {
            const previewData = await previewRes.json();
            setDocumentContent(previewData.content);
          }
        }

        // Get next question
        if (data.nextQuestion) {
          messageIdCounter.current += 1;
          const botMessage: ChatMessage = {
            id: `msg-${messageIdCounter.current}`,
            role: 'bot',
            content: data.nextQuestion,
            timestamp: new Date().toISOString(),
            fieldId: data.nextFieldId,
          };
          setMessages(prev => [...prev, botMessage]);
          setCurrentFieldId(data.nextFieldId);
        } else {
          // All done
          messageIdCounter.current += 1;
          const botMessage: ChatMessage = {
            id: `msg-${messageIdCounter.current}`,
            role: 'bot',
            content: 'Great! All fields have been completed. Redirecting to download page...',
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, botMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFieldEdit = (fieldId: string) => {
    // Switch to chat view and focus on that field
    setViewMode('chat');
    setCurrentFieldId(fieldId);
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      messageIdCounter.current += 1;
      const botMessage: ChatMessage = {
        id: `msg-${messageIdCounter.current}`,
        role: 'bot',
        content: `Let's update the ${field.name}. What should the new value be?`,
        timestamp: new Date().toISOString(),
        fieldId: field.id,
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleFieldFill = (fieldId: string) => {
    handleFieldEdit(fieldId);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-4">Error Loading Document</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-dark-panel border border-dark-border text-gray-200 rounded-lg hover:bg-dark-border transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-dark-border bg-dark-panel">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer"
            >
              ⚖️ LegalDoc Filler
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          <ProgressSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px] mt-6">
            <ChatSkeleton />
            <PreviewSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-lg sm:text-xl font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer"
          >
            ⚖️ LegalDoc Filler
          </button>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-gray-400 truncate max-w-[150px] sm:max-w-none">{documentFilename}</span>
            <button
              onClick={() => router.push('/')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-dark-lighter border border-dark-border text-gray-200 rounded hover:bg-dark-border transition-colors whitespace-nowrap"
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress Bar */}
        <ProgressBar
          completed={completedFields}
          total={totalFields}
          percentage={completionPercentage}
        />

        {/* View Toggle */}
        <div className="flex gap-3 my-6">
          <button
            onClick={() => setViewMode('chat')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'chat'
                ? 'bg-activeTab text-white'
                : 'bg-dark-panel border border-dark-border text-secondaryText hover:text-foreground'
            }`}
          >
            Chat View
          </button>
          <button
            onClick={() => setViewMode('fields')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'fields'
                ? 'bg-activeTab text-white'
                : 'bg-dark-panel border border-dark-border text-secondaryText hover:text-foreground'
            }`}
          >
            Field List
          </button>
        </div>

        {/* Content Area */}
        {viewMode === 'chat' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
            />
            <DocumentPreview
              content={documentContent}
              fields={fields}
              onFieldClick={handleFieldEdit}
            />
          </div>
        ) : (
          <FieldListView
            fields={fields}
            onFieldEdit={handleFieldEdit}
            onFieldFill={handleFieldFill}
          />
        )}
      </main>
    </div>
  );
}

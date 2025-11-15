export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full border-2 border-dark-border rounded-lg bg-dark-panel overflow-hidden">
      <div className="bg-dark-lighter px-5 py-4 border-b-2 border-dark-border">
        <div className="h-5 bg-dark-border rounded w-32 animate-pulse"></div>
      </div>
      <div className="flex-1 p-5 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] h-16 bg-dark-border rounded-lg animate-pulse`}></div>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-dark-border p-4 bg-dark-panel">
        <div className="h-10 bg-dark-border rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className="flex flex-col h-full border-2 border-dark-border rounded-lg bg-dark-panel overflow-hidden">
      <div className="bg-dark-lighter px-5 py-4 border-b-2 border-dark-border">
        <div className="h-5 bg-dark-border rounded w-32 animate-pulse"></div>
      </div>
      <div className="flex-1 p-8 bg-white">
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="bg-dark-panel border-2 border-dark-border rounded-lg p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="h-5 bg-dark-border rounded w-48 animate-pulse"></div>
        <div className="h-5 bg-dark-border rounded w-24 animate-pulse"></div>
      </div>
      <div className="h-2 bg-dark-border rounded-full animate-pulse"></div>
    </div>
  );
}

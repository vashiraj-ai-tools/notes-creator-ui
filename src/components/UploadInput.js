'use client';

import { useState, useRef, useCallback } from 'react';

const TABS = [
  { id: 'video', label: 'Video File', icon: '🎬', accept: 'video/*', maxMB: 500 },
  { id: 'text', label: 'Paste Text', icon: '📝', accept: null, maxMB: null },
  { id: 'document', label: 'PDF / Doc', icon: '📄', accept: '.pdf,.docx,.txt', maxMB: 50 },
];

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadInput({ onSubmit, isLoading }) {
  const [activeTab, setActiveTab] = useState('video');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const currentTab = TABS.find(t => t.id === activeTab);

  const handleFile = useCallback((incoming) => {
    if (!incoming) return;
    const maxBytes = currentTab.maxMB ? currentTab.maxMB * 1024 * 1024 : Infinity;
    if (incoming.size > maxBytes) {
      alert(`File too large. Maximum size is ${currentTab.maxMB} MB.`);
      return;
    }
    setFile(incoming);
  }, [currentTab]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    setFile(null);
    setTextContent('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'text') {
      if (!textContent.trim() || textContent.trim().length < 50) return;
      onSubmit({ uploadType: 'text', textContent: textContent.trim(), file: null });
    } else {
      if (!file) return;
      onSubmit({ uploadType: activeTab, textContent: null, file });
    }
  };

  const canSubmit = !isLoading && (
    (activeTab === 'text' && textContent.trim().length >= 50) ||
    (activeTab !== 'text' && file !== null)
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabSwitch(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
              }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content area */}
      {activeTab === 'text' ? (
        <div className="relative">
          <textarea
            id="text-paste-input"
            placeholder="Paste your article, document, or notes here… (minimum 50 characters)"
            className="glass-input block w-full px-4 py-4 rounded-xl text-foreground placeholder-foreground/40 text-sm focus:outline-none resize-none min-h-[220px]"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            disabled={isLoading}
          />
          <div className={`absolute bottom-3 right-4 text-xs tabular-nums transition-colors ${textContent.length < 50 ? 'text-foreground/30' : 'text-primary/70'
            }`}>
            {textContent.length.toLocaleString()} chars
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[220px] px-6 py-10 ${dragOver
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : file
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-border hover:border-primary/50 hover:bg-white/3 bg-surface'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={currentTab.accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={isLoading}
          />

          {file ? (
            <>
              <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center text-2xl">
                {activeTab === 'video' ? '🎬' : '📄'}
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-foreground/50 mt-0.5">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-foreground/40 hover:text-red-400 transition-colors"
              >
                Remove file
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" className="text-primary">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {dragOver ? 'Drop it here!' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-sm text-foreground/50 mt-1">
                  {activeTab === 'video'
                    ? 'MP4, MOV, AVI, MKV, WEBM · up to 500 MB'
                    : 'PDF, DOCX, TXT · up to 50 MB'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Submit button */}
      <button
        id="upload-generate-btn"
        type="submit"
        disabled={!canSubmit}
        className="primary-button py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing…
          </>
        ) : (
          <>
            Generate Notes
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

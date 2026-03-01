import ReactMarkdown from 'react-markdown';

export default function MarkdownOutput({ content }) {
  if (!content) return null;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl w-full max-w-4xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="markdown-body">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex justify-end">
        <button
          onClick={() => {
            navigator.clipboard.writeText(content);
            // In a real app we'd trigger a toast here
            alert('Notes copied to clipboard!');
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}

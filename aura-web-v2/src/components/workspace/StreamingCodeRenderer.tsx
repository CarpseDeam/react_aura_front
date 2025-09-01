import { useState, useEffect, useRef } from 'react';
import './CodeViewer.css'; // Reuse styles

interface StreamingCodeRendererProps {
  content: string;
  language: string;
}

// Helper function to render code lines, keeping it consistent with CodeViewer
const renderCodeContent = (content: string, language: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => (
      <div key={index} className={`code-line ${language}`}>
        {line || '\u00A0'} {/* Non-breaking space for empty lines */}
      </div>
    ));
};

export const StreamingCodeRenderer = ({ content, language }: StreamingCodeRendererProps) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // When the target content changes, we update the displayed content
    // with a typing effect.
    if (displayedContent !== content) {
      // If content is shrinking (e.g., agent deletes code), snap immediately
      if (displayedContent.length > content.length) {
        setDisplayedContent(content);
        return;
      }

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const type = () => {
        const currentLength = displayedContent.length;
        if (currentLength < content.length) {
          // Type faster by grabbing a small chunk
          const nextLength = Math.min(currentLength + 15, content.length);
          setDisplayedContent(content.substring(0, nextLength));
        } 
      };
      
      // Start the typing animation
      timerRef.current = window.setTimeout(type, 16); // ~60fps
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [content, displayedContent]);

  // On initial mount, if there's content, display it immediately without typing
  useEffect(() => {
    setDisplayedContent(content);
  }, []);

  return <>{renderCodeContent(displayedContent, language)}</>;
};

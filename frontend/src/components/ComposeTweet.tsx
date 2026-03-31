import { useState, useRef, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { CREATE_TWEET } from '../graphql/operations';
import { useAuth } from '../context/AuthContext';

interface ComposeProps {
  parentId?: string;
  placeholder?: string;
  onComplete?: () => void;
}

export function ComposeTweet({ parentId, placeholder, onComplete }: ComposeProps) {
  const [content, setContent] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, isAuthenticated } = useAuth();

  const [createTweet, { loading }] = useMutation(CREATE_TWEET, {
    update(cache, { data }) {
      if (!data?.createTweet || data.createTweet.parentId) return; // don't add replies to feed
      cache.modify({
        fields: {
          feed(existing = { items: [], total: 0, hasMore: false }) {
            const newTweetRef = cache.writeFragment({
              data: data.createTweet,
              fragment: gql`
                fragment NewTweet on Tweet {
                  id
                  content
                  parentId
                  createdAt
                  author { id username }
                  likesCount
                  repliesCount
                }
              `,
            });
            return {
              ...existing,
              total: existing.total + 1,
              items: [newTweetRef, ...existing.items],
            };
          },
        },
      });
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!content.trim() || !isAuthenticated) return;
    try {
      await createTweet({
        variables: {
          input: {
            content: content.trim(),
            ...(parentId && { parentId }),
          },
        },
      });
      setContent('');
      setFocused(false);
      onComplete?.();
    } catch (err) {
      console.error('Failed to create tweet:', err);
    }
  };

  if (!isAuthenticated) return null;

  const charsLeft = 280 - content.length;
  const charsPercent = (content.length / 280) * 100;

  return (
    <div className={`flex gap-3 px-4 py-3 ${!parentId ? 'border-b border-x-border' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        <img
          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.username}`}
          alt={user?.username}
          className="w-10 h-10 rounded-full bg-x-gray-500"
        />
      </div>

      {/* Input area */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder || "What is happening?!"}
          maxLength={280}
          className="w-full bg-transparent text-xl text-x-gray-50 placeholder:text-x-gray-300 resize-none focus:outline-none min-h-[52px] py-3"
        />

        {/* Toolbar */}
        <div className={`flex items-center justify-between ${focused || content ? 'border-t border-x-border pt-3' : ''}`}>
          {/* Media icons */}
          <div className="flex items-center -ml-2">
            {/* Image */}
            <button className="p-2 rounded-full hover:bg-x-blue/10 transition-colors text-x-blue">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
              </svg>
            </button>
            {/* GIF */}
            <button className="p-2 rounded-full hover:bg-x-blue/10 transition-colors text-x-blue">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M3 5.5C3 4.119 4.12 3 5.5 3h13C19.88 3 21 4.119 21 5.5v13c0 1.381-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.881 3 18.5v-13zM5.5 5c-.28 0-.5.224-.5.5v13c0 .276.22.5.5.5h13c.28 0 .5-.224.5-.5v-13c0-.276-.22-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.85 0 1.54-.344 2.05-.945v-2.149H8.38v1.032H9.4v.515c-.17.086-.42.172-.68.172-.93 0-1.37-.773-1.37-1.375s.44-1.375 1.37-1.375z" />
              </svg>
            </button>
            {/* Emoji */}
            <button className="p-2 rounded-full hover:bg-x-blue/10 transition-colors text-x-blue">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.054 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Character count ring */}
            {content.length > 0 && (
              <div className="relative w-[30px] h-[30px]">
                <svg className="w-[30px] h-[30px] -rotate-90" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r="12" fill="none" stroke="#2f3336" strokeWidth="2" />
                  <circle
                    cx="15" cy="15" r="12" fill="none"
                    stroke={charsLeft < 0 ? '#f4212e' : charsLeft < 20 ? '#ffd400' : '#1d9bf0'}
                    strokeWidth="2"
                    strokeDasharray={`${(charsPercent / 100) * 75.4} 75.4`}
                    strokeLinecap="round"
                  />
                </svg>
                {charsLeft <= 20 && (
                  <span className={`absolute inset-0 flex items-center justify-center text-[11px] ${charsLeft < 0 ? 'text-[#f4212e]' : 'text-x-gray-300'}`}>
                    {charsLeft}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading || charsLeft < 0}
              className="bg-x-blue hover:bg-x-blue-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full px-4 py-1.5 text-[15px] transition-colors"
            >
              {loading ? 'Posting...' : parentId ? 'Reply' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

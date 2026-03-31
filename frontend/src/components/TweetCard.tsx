import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { TOGGLE_LIKE, IS_LIKED } from '../graphql/operations';
import { useAuth } from '../context/AuthContext';

interface TweetProps {
  tweet: {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; username: string };
    likesCount: number;
    repliesCount: number;
  };
}

export function TweetCard({ tweet }: TweetProps) {
  const { isAuthenticated, user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount);

  // Check if current user has liked this tweet
  const { data: likedData } = useQuery(IS_LIKED, {
    variables: { tweetId: tweet.id },
    skip: !isAuthenticated,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (likedData?.isLiked !== undefined) {
      setLiked(likedData.isLiked);
    }
  }, [likedData]);

  const [toggleLike] = useMutation(TOGGLE_LIKE);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const { data } = await toggleLike({ variables: { tweetId: tweet.id } });
      setLiked(data.toggleLike);
      setLikesCount((prev: number) => (data.toggleLike ? prev + 1 : prev - 1));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link
      to={`/${tweet.author.username}/status/${tweet.id}`}
      className="flex gap-3 px-4 py-3 border-b border-x-border hover:bg-x-hover transition-colors cursor-pointer"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <img
          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${tweet.author.username}`}
          alt={tweet.author.username}
          className="w-10 h-10 rounded-full bg-x-gray-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1">
          <span className="font-bold text-[15px] truncate">{tweet.author.username}</span>
          <span className="text-x-gray-300 text-[15px] truncate">@{tweet.author.username}</span>
          <span className="text-x-gray-300 text-[15px] flex-shrink-0">·</span>
          <span className="text-x-gray-300 text-[15px] flex-shrink-0 hover:underline">
            {timeAgo(tweet.createdAt)}
          </span>
        </div>

        {/* Body */}
        <div className="text-[15px] leading-5 mt-0.5 whitespace-pre-wrap break-words">
          {tweet.content}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between max-w-[425px] mt-3 -ml-2">
          {/* Reply */}
          <ActionButton
            icon={
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                <path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
              </svg>
            }
            count={tweet.repliesCount}
            color="blue"
          />

          {/* Repost */}
          <ActionButton
            icon={
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                <path fill="currentColor" d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
              </svg>
            }
            count={0}
            color="green"
          />

          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center group"
          >
            <div className={`p-2 rounded-full transition-colors ${liked ? 'text-x-pink' : 'text-x-gray-300 group-hover:text-x-pink'} group-hover:bg-x-pink/10`}>
              {liked ? (
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                  <path fill="currentColor" d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.55-.334-6.07.929-1.265 2.747-1.993 4.533-1.993 1.531 0 2.97.587 3.685 1.563l1 1.368 1-1.368c.715-.976 2.154-1.563 3.685-1.563 1.786 0 3.604.728 4.533 1.993 1.117 1.52 1.027 3.57-.334 6.07z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                  <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.55-.334-6.07C4.684 5.65 6.447 4.93 8.185 4.93c1.56 0 2.97.59 3.815 1.56.845-.97 2.256-1.56 3.815-1.56 1.738 0 3.501.72 4.4 2.19 1.117 1.52 1.027 3.57-.334 6.07z" />
                </svg>
              )}
            </div>
            {likesCount > 0 && (
              <span className={`text-13 -ml-1 ${liked ? 'text-x-pink' : 'text-x-gray-300 group-hover:text-x-pink'}`}>
                {likesCount}
              </span>
            )}
          </button>

          {/* Views */}
          <ActionButton
            icon={
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                <path fill="currentColor" d="M8.75 21V3h2v18h-2zM18.75 21V8.5h2V21h-2zM13.75 21v-9h2v9h-2zM3.75 21v-4h2v4h-2z" />
              </svg>
            }
            count={tweet.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900 + 100}
            color="blue"
          />

          {/* Share */}
          <div className="flex items-center group">
            <div className="p-2 rounded-full text-x-gray-300 group-hover:text-x-blue group-hover:bg-x-blue/10 transition-colors">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                <path fill="currentColor" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActionButton({
  icon,
  count,
  color,
}: {
  icon: React.ReactNode;
  count: number;
  color: 'blue' | 'green' | 'pink';
}) {
  const hoverColors = {
    blue: 'group-hover:text-x-blue group-hover:bg-x-blue/10',
    green: 'group-hover:text-x-green group-hover:bg-x-green/10',
    pink: 'group-hover:text-x-pink group-hover:bg-x-pink/10',
  };
  const textHover = {
    blue: 'group-hover:text-x-blue',
    green: 'group-hover:text-x-green',
    pink: 'group-hover:text-x-pink',
  };

  return (
    <div className="flex items-center group cursor-pointer">
      <div className={`p-2 rounded-full text-x-gray-300 transition-colors ${hoverColors[color]}`}>
        {icon}
      </div>
      {count > 0 && (
        <span className={`text-13 text-x-gray-300 -ml-1 transition-colors ${textHover[color]}`}>
          {count}
        </span>
      )}
    </div>
  );
}
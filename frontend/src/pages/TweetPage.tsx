import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_TWEET } from '../graphql/operations';
import { TweetCard } from '../components/TweetCard';
import { ComposeTweet } from '../components/ComposeTweet';
import { useAuth } from '../context/AuthContext';

export function TweetPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { data, loading, refetch } = useQuery(GET_TWEET, {
    variables: { id },
    fetchPolicy: 'network-only', // always get fresh data including new replies
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-x-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.tweet) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="text-x-gray-300 text-[15px] mb-3">This post doesn't exist.</p>
        <Link to="/" className="text-x-blue text-[15px] hover:underline">Back to feed</Link>
      </div>
    );
  }

  const { tweet } = data;

  return (
    <>
      {/* Back header */}
      <div className="sticky top-[53px] z-10 bg-x-black/80 backdrop-blur-md border-b border-x-border flex items-center gap-6 px-4 py-2">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-x-gray-600/30 transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-x-gray-50">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {/* Main tweet — expanded view */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${tweet.author.username}`}
            alt={tweet.author.username}
            className="w-10 h-10 rounded-full bg-x-gray-500 flex-shrink-0"
          />
          <div>
            <div className="font-bold text-[15px] leading-5">{tweet.author.username}</div>
            <div className="text-x-gray-300 text-13 leading-4">@{tweet.author.username}</div>
          </div>
        </div>

        <div className="text-[17px] leading-6 mb-3 whitespace-pre-wrap">
          {tweet.content}
        </div>

        {/* Timestamp */}
        <div className="text-x-gray-300 text-[15px] pb-3 border-b border-x-border">
          {new Date(tweet.createdAt).toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })} · {new Date(tweet.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>

        {/* Engagement stats */}
        {(tweet.repliesCount > 0 || tweet.likesCount > 0) && (
          <div className="flex gap-5 py-3 border-b border-x-border text-[15px]">
            {tweet.repliesCount > 0 && (
              <div>
                <span className="font-bold text-x-gray-50">{tweet.repliesCount}</span>
                <span className="text-x-gray-300 ml-1">{tweet.repliesCount === 1 ? 'Reply' : 'Replies'}</span>
              </div>
            )}
            {tweet.likesCount > 0 && (
              <div>
                <span className="font-bold text-x-gray-50">{tweet.likesCount}</span>
                <span className="text-x-gray-300 ml-1">{tweet.likesCount === 1 ? 'Like' : 'Likes'}</span>
              </div>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-around py-1 border-b border-x-border text-x-gray-300">
          <button className="p-2 rounded-full hover:bg-x-blue/10 hover:text-x-blue transition-colors">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
              <path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-x-green/10 hover:text-x-green transition-colors">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
              <path fill="currentColor" d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-x-pink/10 hover:text-x-pink transition-colors">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
              <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.55-.334-6.07C4.684 5.65 6.447 4.93 8.185 4.93c1.56 0 2.97.59 3.815 1.56.845-.97 2.256-1.56 3.815-1.56 1.738 0 3.501.72 4.4 2.19 1.117 1.52 1.027 3.57-.334 6.07z" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-x-blue/10 hover:text-x-blue transition-colors">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
              <path fill="currentColor" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Reply composer */}
      {isAuthenticated && (
        <ComposeTweet
          parentId={tweet.id}
          placeholder="Post your reply"
          onComplete={() => refetch()}
        />
      )}

      {/* Replies */}
      {tweet.replies && tweet.replies.length > 0 ? (
        tweet.replies.map((reply: any) => (
          <TweetCard key={reply.id} tweet={reply} />
        ))
      ) : (
        <div className="px-4 py-8 text-center text-x-gray-300 text-[15px] border-b border-x-border">
          No replies yet
        </div>
      )}
    </>
  );
}

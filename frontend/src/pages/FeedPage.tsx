import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_FEED, TWEET_CREATED_SUB } from '../graphql/operations';
import { TweetCard } from '../components/TweetCard';
import { ComposeTweet } from '../components/ComposeTweet';
import { useAuth } from '../context/AuthContext';

export function FeedPage() {
  const { isAuthenticated } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingMore = useRef(false);

  const { data, loading, fetchMore, client } = useQuery(GET_FEED, {
    variables: { limit: 10, offset: 0 },
  });

  // Real-time: subscribe to new tweets and prepend to cache
  useSubscription(TWEET_CREATED_SUB, {
    onData: ({ data: subData }) => {
      const newTweet = subData.data?.tweetCreated;
      if (!newTweet || newTweet.parentId) return; // skip replies

      client.cache.modify({
        fields: {
          feed(existing = { items: [], total: 0, hasMore: false }, { readField, toReference }) {
            // Don't add duplicates (e.g. if we posted it ourselves)
            const alreadyExists = existing.items.some(
              (ref: any) => readField('id', ref) === newTweet.id,
            );
            if (alreadyExists) return existing;

            const newRef = toReference(newTweet, true);
            return {
              ...existing,
              total: existing.total + 1,
              items: [newRef, ...existing.items],
            };
          },
        },
      });
    },
  });

  const loadMore = useCallback(() => {
    if (!data?.feed.hasMore || loadingMore.current) return;
    loadingMore.current = true;

    fetchMore({
      variables: { offset: data.feed.items.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        loadingMore.current = false;
        if (!fetchMoreResult) return prev;
        return {
          feed: {
            ...fetchMoreResult.feed,
            items: [...prev.feed.items, ...fetchMoreResult.feed.items],
          },
        };
      },
    });
  }, [data, fetchMore]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      {/* Compose */}
      {isAuthenticated && <ComposeTweet />}

      {/* Initial loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-x-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Tweets */}
      {data?.feed.items.map((tweet: any) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}

      {/* Infinite scroll trigger + loading indicator */}
      {data?.feed.hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-x-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* End of feed */}
      {data && !data.feed.hasMore && data.feed.items.length > 0 && (
        <div className="py-8 text-center text-x-gray-300 text-[15px] border-b border-x-border">
          You've reached the end
        </div>
      )}

      {/* Empty */}
      {data && data.feed.items.length === 0 && (
        <div className="px-8 py-12 text-center">
          <h2 className="text-[31px] font-extrabold mb-2">Welcome</h2>
          <p className="text-x-gray-300 text-[15px]">
            No posts yet. Be the first!
          </p>
        </div>
      )}
    </>
  );
}

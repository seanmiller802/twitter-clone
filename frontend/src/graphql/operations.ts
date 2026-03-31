import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        username
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        username
        email
      }
    }
  }
`;

export const GET_FEED = gql`
  query Feed($limit: Int, $offset: Int) {
    feed(limit: $limit, offset: $offset) {
      items {
        id
        content
        parentId
        createdAt
        author {
          id
          username
        }
        likesCount
        repliesCount
      }
      total
      hasMore
    }
  }
`;

export const GET_TWEET = gql`
  query Tweet($id: String!) {
    tweet(id: $id) {
      id
      content
      parentId
      createdAt
      author {
        id
        username
      }
      likesCount
      repliesCount
      replies {
        id
        content
        createdAt
        author {
          id
          username
        }
        likesCount
        repliesCount
      }
    }
  }
`;

export const CREATE_TWEET = gql`
  mutation CreateTweet($input: CreateTweetInput!) {
    createTweet(input: $input) {
      id
      content
      parentId
      createdAt
      author {
        id
        username
      }
      likesCount
      repliesCount
    }
  }
`;

export const TOGGLE_LIKE = gql`
  mutation ToggleLike($tweetId: String!) {
    toggleLike(tweetId: $tweetId)
  }
`;

export const DELETE_TWEET = gql`
  mutation DeleteTweet($id: String!) {
    deleteTweet(id: $id)
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`;

export const TWEET_CREATED_SUB = gql`
  subscription TweetCreated {
    tweetCreated {
      id
      content
      parentId
      createdAt
      author {
        id
        username
      }
      likesCount
      repliesCount
    }
  }
`;

export const IS_LIKED = gql`
  query IsLiked($tweetId: String!) {
    isLiked(tweetId: $tweetId)
  }
`;

import { gql } from '@apollo/client';

export const GET_USER = gql`
  query getUser($username: String!) {
    user(username: $username) {
      id
      username
      email
      city
      birthday
      aboutMe
      profilePicture
      posts {
        id
        text
        date
        author {
          id
          username
        }
        comments {
          id
          text
          author {
            id
            username
          }
        }
      }
    }
  }
`;

export const SEARCH_USER = gql`
  query searchUser($username: String!) {
    searchUser(username: $username) {
      _id
      username
      profilePicture

    }
  }
`;

export const GET_MESSAGES = gql`
  query getMessages {
    messages {
      id
      sender {
        username
      }
      receiver {
        username
      }
      message
      timestamp
    }
  }
`;


export const GET_POSTS = gql`
  query getPosts {
    posts {
      id
      text
      date
      author {
        id
        username
      }
      comments {
        id
        text
        author {
          id
          username
        }
      }
    }
  }
`;

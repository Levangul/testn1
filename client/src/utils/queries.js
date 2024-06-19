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

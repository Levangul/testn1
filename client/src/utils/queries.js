import { gql } from '@apollo/client';

export const GET_POSTS = gql`
  query getPosts {
    posts {
      id
      text
      date
      author {
        username
      }
      comments {
        id
        text
        author {
          username
        }
      }
    }
  }
`;
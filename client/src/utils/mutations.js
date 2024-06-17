import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`;
export const ADD_POST = gql`
  mutation addPost($text: String!) {
    addPost(text: $text) {
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

export const ADD_COMMENT = gql`
  mutation addComment($postId: ID!, $text: String!) {
    addComment(postId: $postId, text: $text) {
      id
      text
      author {
        username
      }
      post {
        id
      }
    }
  }
`;
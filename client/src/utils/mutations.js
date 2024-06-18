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

export const ADD_COMMENT = gql`
  mutation addComment($postId: ID!, $text: String!) {
    addComment(postId: $postId, text: $text) {
      id
      text
      author {
        id
        username
      }
      post {
        id
      }
    }
  }
`;

export const REMOVE_POST = gql`
  mutation removePost($postId: ID!) {
    removePost(postId: $postId) {
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

export const REMOVE_COMMENT = gql`
  mutation removeComment($commentId: ID!) {
    removeComment(commentId: $commentId) {
      id
      text
      author {
        id
        username
      }
      post {
        id
      }
    }
  }
`;
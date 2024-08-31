import { gql } from '@apollo/client';

export const GET_USER = gql`
  query getUser($name: String!, $lastname: String!) {
    user(name: $name, lastname: $lastname) {
      id
      name
      lastname
      email
      city
      birthday
      aboutMe
      profilePicture
      friends {
        id
        name
        lastname
        profilePicture
      }
      friendRequests {
        id
        name
        lastname
        profilePicture
      }
      posts {
        id
        text
        date
        author {
          id
          name
          lastname
        }
        comments {
          id
          text
          date
          author {
            id
            name
            lastname
          }
          replies {
            id
            text
            date
            author {
              id
              name
              lastname
            }
            date
          }
        }
      }
    }
  }
`;


export const SEARCH_USER = gql`
  query searchUser($name: String!, $lastname: String!) {
    searchUser(name: $name, lastname: $lastname) {
      id
      name
      lastname
      profilePicture
    }
  }
`;

export const GET_MESSAGES = gql`
  query getMessages {
    messages {
      id
      sender {
        id
        name
        lastname
      }
      receiver {
        id
        name
        lastname
      }
      message
      date
      read
    }
  }
`;

export const GET_FRIEND_REQUESTS = gql`
  query getFriendRequests {
    user {
      id
      name
      lastname
      friendRequests {
        id
        name
        lastname
        profilePicture
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
        profilePicture
        id
        name
        lastname
      }
      comments {
        id
        text
        date
        author {
          profilePicture
          id
          name
          lastname
        }
        replies {
          id
          text
          date
          author {
            profilePicture
            id
            name
            lastname
          }
        }
      }
    }
  }
`;

// export const GET_REPLIES = gql`
//   query getReplies($commentId: ID!) {
//     comment(id: $commentId) {
//       replies {
//         id
//         text
//         date
//         author {
//           id
//           name
//           lastname
//           profilePicture
//         }
//       }
//     }
//   }
// `;
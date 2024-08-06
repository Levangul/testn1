import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        lastname
      }
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation addUser($name: String!, $lastname: String!, $email: String!, $password: String!) {
    addUser(name: $name, lastname: $lastname, email: $email, password: $password) {
      token
      user {
        id
        name
        lastname
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
      }
    }
  }
`;

// export const SEND_MESSAGE = gql`
//   mutation sendMessage($receiverId: ID!, $message: String!) {
//     sendMessage(receiverId: $receiverId, message: $message) {
//       id
//       sender {
//         id
//         name
//         lastname
//       }
//       receiver {
//         id
//         name
//         lastname
//       }
//       message
//       timestamp
//       read
//     }
//   }
// `;

export const MARK_MESSAGES_AS_READ = gql`
  mutation markMessagesAsRead($receiverId: ID!) {
    markMessagesAsRead(receiverId: $receiverId)
  }
`;

export const ADD_COMMENT = gql`
  mutation addComment($postId: ID!, $text: String!) {
    addComment(postId: $postId, text: $text) {
      id
      text
      date
      author {
        id
        name
        lastname
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
    }
  }
`;

export const REMOVE_COMMENT = gql`
  mutation removeComment($commentId: ID!) {
    removeComment(commentId: $commentId) {
      id
      text
      date
      author {
        id
        name
        lastname
      }
      post {
        id
      }
    }
  }
`;

export const UPDATE_USER_INFO = gql`
  mutation updateUserInfo($city: String, $birthday: String, $aboutMe: String, $profilePicture: String) {
    updateUserInfo(city: $city, birthday: $birthday, aboutMe: $aboutMe, profilePicture: $profilePicture) {
      id
      name
      lastname
      city
      birthday
      aboutMe
      profilePicture
    }
  }
`;

export const ADD_FRIEND = gql`
  mutation addFriend($friendId: ID!) {
    addFriend(friendId: $friendId) {
      id
      name
      lastname
      profilePicture
    }
  }
`;

export const REMOVE_FRIEND = gql`
  mutation removeFriend($friendId: ID!) {
    removeFriend(friendId: $friendId) {
      id
      name
      lastname
      profilePicture
    }
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation sendFriendRequest($friendId: ID!) {
    sendFriendRequest(friendId: $friendId) {
      id
      name
      lastname
      profilePicture
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation acceptFriendRequest($friendId: ID!) {
    acceptFriendRequest(friendId: $friendId) {
      id
      name
      lastname
      profilePicture
      friends {
        id
        name
        lastname
        profilePicture
      }
    }
  }
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation rejectFriendRequest($friendId: ID!) {
    rejectFriendRequest(friendId: $friendId)
  }
`;

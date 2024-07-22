const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID
    name: String
    lastname: String
    email: String
    password: String
    posts: [Post]
    city: String
    birthday: String
    aboutMe: String
    profilePicture: String
    friends: [User]
  }

  type Post {
    id: ID 
    text: String
    date: String
    author: User
    comments: [Comment]
  }

  type Comment {
    id: ID
    text: String
    date: String
    author: User
    post: Post
  }

  type Message {
    id: ID
    sender: User
    receiver: User
    message: String
    timestamp: String
    read: Boolean!
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(name: String!, lastname: String!): User
    userById(id: ID!): User
    posts: [Post]
    post(id: ID!): Post
    comments(postId: ID!): [Comment]
    searchUser(name: String!, lastname: String!): [User]
    messages: [Message]
  }

  type Mutation {
    addUser(name: String!, lastname: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addPost(text: String!): Post
    addComment(postId: ID!, text: String!): Comment
    removePost(postId: ID!): Post
    removeComment(commentId: ID!): Comment
    updateUserInfo(city: String, birthday: String, aboutMe: String, profilePicture: String): User
    sendMessage(receiverId: ID!, message: String!): Message
    markMessagesAsRead(receiverId: ID!): Boolean
    addFriend(friendId: ID!): User
    removeFriend(friendId: ID!): User
  }
`;

module.exports = typeDefs;


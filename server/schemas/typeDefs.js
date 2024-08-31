// schema/typeDefs.js

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String
    lastname: String
    email: String!
    posts: [Post!]!
    city: String
    birthday: Date
    aboutMe: String
    profilePicture: String
    friends: [User!]!
    friendRequests: [User!]!
  }

  type Post {
    id: ID!
    text: String!
    date: Date!
    author: User!
    comments: [Comment!]!
    upvotes: Int!
  }

  type Comment {
    id: ID!
    text: String!
    date: Date!
    author: User!
    post: Post!
    replies: [Reply!]!
  }

  type Reply {
    id: ID!
    text: String!
    date: Date!
    author: User!
    comment: Comment!
  }

  type Message {
    id: ID!
    sender: User!
    receiver: User!
    message: String!
    date: Date!
    read: Boolean!
  }

  type Auth {
    token: ID!
    user: User!
  }

  type Query {
    users: [User!]!
    user(name: String!, lastname: String!): User
    userById(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
    comments(postId: ID!): [Comment!]!
    replies(commentId: ID!): [Reply!]!
    searchUser(name: String, lastname: String): [User!]!
    messages: [Message!]!
  }

  type Mutation {
    addUser(
      name: String!
      lastname: String!
      email: String!
      password: String!
    ): Auth!

    login(email: String!, password: String!): Auth!

    addPost(text: String!): Post!

    removePost(postId: ID!): Post!

    addComment(postId: ID!, text: String!): Comment!

    removeComment(commentId: ID!): Comment!

    addReply(commentId: ID!, text: String!): Reply!

    removeReply(replyId: ID!): Reply!

    updateUserInfo(
      city: String
      birthday: Date
      aboutMe: String
      profilePicture: String
    ): User!

    sendMessage(receiverId: ID!, message: String!): Message!

    markMessagesAsRead(senderId: ID!): Boolean!

    sendFriendRequest(friendId: ID!): User!

    acceptFriendRequest(friendId: ID!): User!

    rejectFriendRequest(friendId: ID!): Boolean!

    removeFriend(friendId: ID!): User!
  }
`;

module.exports = typeDefs;

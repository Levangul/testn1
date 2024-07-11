const typeDefs = `#graphql
type User {
  id: ID
  username: String
  email: String
  password: String
  posts: [Post]
  city: String
  birthday: String
  aboutMe: String
  profilePicture: String
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

type Auth {
  token: ID!
  user: User
}

type Query {
  users: [User]
  user(username: String!): User
  userById(id: ID!): User
  posts: [Post]
  post(id: ID!): Post
  comments(postId: ID!): [Comment]
}

type Mutation {
  addUser(username: String!, email: String!, password: String!): Auth
  login(email: String!, password: String!): Auth
  addPost(text: String!): Post
  addComment(postId: ID!, text: String!): Comment
  removePost(postId: ID!): Post
  removeComment(commentId: ID!): Comment
  updateUserInfo(city: String, birthday: String, aboutMe: String, profilePicture: String): User
}
`
module.exports = typeDefs;

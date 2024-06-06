const typeDefs = `#graphql
type User {
    id: ID
    username: String
    email: String
    password: String

}
type Auth {
    token: ID!
    user: User
  }

type Query {
    users: [User]
    user(username: String!): User
}
type Mutation {
  addUser(username: String!, email: String!, password: String!): Auth
  login(email: String!, password: String!): Auth
 
}
`
module.exports = typeDefs
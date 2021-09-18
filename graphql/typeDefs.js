const { gql } = require('apollo-server');

module.exports = gql`
    type Post{
        id : ID!
        body: String!
        createdAt: String!
        username: String!
        comments: [Comment]!
        likes:[Like]!
        likeCount: Int!
        commentCount: Int!
    }
    type Comment {
        id: ID!
        createdAt: String!
        username: String!
        body: String!
    }
    type Like {
        id: ID!
        createdAt: String!
        username: String!
    }
    input RegisterInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!

    }
    type Chat{
        id: ID!
        createdAt: String!
        sender: String!
        receiver: String!
        message: String!
    }
    type Query{
        getPosts: [Post],
        getPost(postId: ID!): Post!,
        getMessages(sendername: String!, inverse: Boolean!): [Chat]
    }
    type Mutation{
        register(registerInput: RegisterInput) : User!,
        login(username: String, password: String!, email: String): User!
        createPost(body: String!):Post!
        deletePost(postId: ID): String!
        createComment(postId: ID! , body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
        createMessage(message: String!,receivername: String! ): Chat!
    }
    type Subscription{
        newPost: Post!,
        newMessage(receivername: String!): Chat!
    }
`
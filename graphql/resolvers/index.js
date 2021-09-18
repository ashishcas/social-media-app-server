const postsResolvers = require('./posts');
const userResolvers = require('./users');
const commentsResolvers = require('./comments');
const chatResolvers = require('./chat');

module.exports ={
    Post: {
        likeCount(parent){
            return parent.likes.length;
        },
        commentCount(parent){
            return parent.comments.length;
        }
    },
    Query: {
        ...postsResolvers.Query,
        ...chatResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation,
        ...chatResolvers.Mutation
    },
    Subscription: {
        ...postsResolvers.Subscription,
        ...chatResolvers.Subscription
    }
}
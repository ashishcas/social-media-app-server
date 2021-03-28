const { AuthenticationError, UserInputError} = require("apollo-server");

const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

module.exports ={
    Query: {
        async getPosts(){
            try{
                 const posts = await Post.find().sort({ createdAt: -1});
                 return posts;
            } catch(e){
                throw new Error(e);
            }
        },
        async getPost(_, { postId}){
            try{
                const post = await Post.findById(postId);

                if(post){
                    return post;
                } else {
                    throw new Error('Post not found');
                }

            } catch(err){
                throw new Error(err);
            }
        }

    },
    Mutation: {
        async createPost(_, { body }, context){
            const userAuthenticated = checkAuth(context);

            if(body.trim() === ''){
                throw new UserInputError('post should not be empty');
            }
            const newPost = new Post({
                body,
                user: userAuthenticated.id,
                username: userAuthenticated.username,
                createdAt: new Date().toISOString()
            })


            const postSaved = await newPost.save();
            try {
                context.pubsub.publish('NEW_POST',{
                        newPost: postSaved
                })
            } catch (err){
                console.log(err);
            }
            return postSaved;
        },
        async deletePost(_,{postId}, context){
            const userAuthenticated = checkAuth(context);

            try{ 
                const post = await Post.findById(postId).exec();
                if(userAuthenticated.username === post.username){
                    await post.delete();
                    return 'POST got deleted';
                } else {
                    throw new AuthenticationError("Action not allowed");
                }
            } catch(err){
                throw new Error(err);
            }

        },
        async likePost(_,{postId}, context){
            const { username }  = checkAuth(context);

            const post = await Post.findById(postId);

            if(post){
                const likedTrue = post.likes.find(like => like.username === username);

                if(likedTrue){
                    // THe user alredy liked it dislike it 
                    post.likes = post.likes.filter(like => like.username !== username);
                } else {
                    // Like post

                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;

            } else {
                throw new UserInputError('Post not found');
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_,val, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}
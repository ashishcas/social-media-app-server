const { AuthenticationError, UserInputError} = require("apollo-server");
const checkAuth = require('../../utils/check-auth');
const Chat = require('../../models/chat');
const { withFilter } = require('apollo-server');


module.exports = {
    Mutation: {
        // create message 
        async createMessage(_, { message, receivername }, context) {
            const userAuthenticated = checkAuth(context);
            if (!message) {
                throw new UserInputError("message not found");
            }
            if (!receivername) {
                throw new UserInputError("Sender name");
            }

            const newMessage = new Chat({
                sender: userAuthenticated.username,
                receiver: receivername,
                message: message,
                createdAt: new Date().toISOString()
            });
            const messageSaved = await newMessage.save();
            try {
                context.pubsub.publish('NEW_MESSAGE',{
                        newMessage: messageSaved
                })
            } catch (err){
                console.log(err);
            }
            return messageSaved;
        }
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter((_, val, { pubsub }) => pubsub.asyncIterator('NEW_MESSAGE'),
            (payload, variables) => {
                return payload.newMessage.receiver === variables.receivername;
            })
        }
    },
    Query: {
        // get all messages
        async getMessages(_, { sendername, inverse }, context) {
            const userAuthenticated = checkAuth(context);

            let findQuery = {
                receiver: userAuthenticated.username,
                ...(sendername && { sender: sendername })
            }
            if (inverse) {
                findQuery = {
                      sender : userAuthenticated.username,
                ...(sendername && { receiver: sendername })
                }
            }

            const messages = await Chat.find(findQuery);
            if(messages.length !== 0){
                return messages;
            } else {
                throw new Error('messages not found');
            }
        } // get all messages
    }


}
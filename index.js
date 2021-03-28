const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose');


const { MONGODB_URL} = require('./config');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const pubsub = new PubSub();

const Port = process.env.PORT || 5000; 


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
})

mongoose.connect(MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
}).then(() => {
    console.log('Connected to MongoDb');
    return server.listen({port: Port})
}).then((res) => {
    console.log(`server is running on ${res.url}`)
}).catch((err) => {
    console.log(err);
})

const { ApolloServer } = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');

const Post = require('./models/Post');
const { MONGOURI } = require('./config');

const typeDefs = gql`
  type Query {
    greet: String!
  }
`;

const resolvers = {
  Query: {
    greet: () => 'Hello World',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

mongoose
  .connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected');
    return server.listen({ port: 5000 }).then((res) => {
      console.log(`Apollo listening at ${res.url}`);
    });
  });

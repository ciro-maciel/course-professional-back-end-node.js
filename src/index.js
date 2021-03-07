const { ApolloServer } = require("apollo-server-lambda");

const {
  backEnd: {
    management: { Authorization, jwtAuthorizationStrategy },
  },
} = require("@ciro-maciel/utility");

const types = require("./types");
const resolvers = require("./resolvers");

const server = new ApolloServer({
  typeDefs: types,
  resolvers,
  debug: false,
  logger: null,
  context: ({ event: { headers = null } }) => {
    let auth = null;

    if (headers.Authorization) {
      auth = new Authorization(jwtAuthorizationStrategy).verify(
        headers.Authorization
      );
    }

    return {
      auth,
    };
  },
  formatError(err) {
    if (!err.originalError) {
      return err;
    }

    const { message, code, status } = err.originalError;

    return {
      message: message || "Internal server error",
      status: status || 500,
      code: code || "SERVER_ERROR",
    };
  },
});

exports.handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});
//

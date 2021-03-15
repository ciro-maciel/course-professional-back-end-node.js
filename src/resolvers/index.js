const { mergeResolvers } = require("@graphql-tools/merge");

const resolvers = [require("./common"), require("./account")];

module.exports = mergeResolvers(resolvers);

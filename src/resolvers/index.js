const { mergeResolvers } = require("merge-graphql-schemas");

const resolvers = [require("./common"), require("./account")];

module.exports = mergeResolvers(resolvers);

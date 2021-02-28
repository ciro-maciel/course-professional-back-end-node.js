const { mergeResolvers } = require("merge-graphql-schemas");

const resolvers = [require("./common"), require("./user")];

module.exports = mergeResolvers(resolvers);

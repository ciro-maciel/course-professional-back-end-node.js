const { mergeTypeDefs } = require("@graphql-tools/merge");

const types = [require("./common"), require("./account")];

module.exports = mergeTypeDefs(types);

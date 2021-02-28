const { mergeTypes } = require("merge-graphql-schemas");

const types = [require("./common"), require("./account")];

module.exports = mergeTypes(types, { all: true });

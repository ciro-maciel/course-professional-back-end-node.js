const { mergeTypes } = require("merge-graphql-schemas");

const types = [require("./common"), require("./user")];

module.exports = mergeTypes(types, { all: true });

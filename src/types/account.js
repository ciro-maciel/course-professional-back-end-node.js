const types = `
    type Account {
        id: ID!
        type: String!
        externalId: String
        email: String!
        photo: String
        financial: String!
        security: String!
        history: String!
        deletedIn: Float
        createdIn: Float
    }
    type Secret {
        code: Int!
        account: Account
        value: String
    }
    input ValidadeInput {
        email: String!
        token: String!
        type: String!
        netInfo: String!
    }
`;

const queries = `
    type Query {
        accountById(id: ID!): Account
    }
`;

const mutations = `
    type Mutation {
        tokenRequest(email: String!): Boolean!
        tokenValidate(validate: ValidadeInput!): Secret!

        accountDisable(id: ID!): Boolean!
    }
`;

module.exports = `
  ${types}
  ${queries}
  ${mutations}
`;
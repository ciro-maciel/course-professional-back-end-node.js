const types = `

    type NetInfo {
        ip: String!
        location: String!
        agent: String!
    }

    type AccountHistory {
        action: String!
        createdIn: Float!
        netInfo: NetInfo
    }
    
    type AccountSecurity {
        password: String
        twoFactor: Boolean
    }

    type Account {
        id: ID!
        type: String!
        email: String!

        security: AccountSecurity
        history: [AccountHistory]

        deletedIn: Float
        createdIn: Float
    }


    input AccountInput {
        id: ID!
        deletedIn: Float
    }
    
    type Secret {
        code: Int!
        account: Account
        value: String
    }

    input NetInfoInput {
        ip: String!
        location: String!
        agent: String!
    }

    input ValidadeInput {
        account: String!
        token: String!
        type: String!
        netInfo: NetInfoInput!
    }

`;

const queries = `
    type Query {
        accountGet(id: ID!): Account
    }
`;

const mutations = `
    type Mutation {
        tokenRequest(email: String!): Boolean!
        tokenValidate(validate: ValidadeInput!): Secret!

        accountPut(account: AccountInput!): Account
    }
`;

module.exports = `
  ${types}
  ${queries}
  ${mutations}
`;

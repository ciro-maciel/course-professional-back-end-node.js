const types = `

    type NetInfo {
        ip: String!
        location: String!
        agent: String!
    }

    type UserHistory {
        action: String!
        createdIn: Float!
        netInfo: NetInfo
    }
    
    type Security {
        password: String
        twoFactor: Boolean
        token: Token
    }

    type User {
        id: ID!
        type: String!
        email: String!
        name: String
        photo: String
        security: Security
        history: [UserHistory]
        deletedIn: Float
        createdIn: Float
    }

    

    input UserInput {
        id: ID!
        type: String
        email: String
        name: String
        photo: String
    }
    
    type Secret {
        code: Int!
        user: User
        value: String
    }

    input NetInfoInput {
        ip: String!
        location: String!
        agent: String!
    }

    input ValidadeInput {
        email: String!
        token: String!
        type: String!
        netInfo: NetInfoInput!
    }


    type UserPagination {
        count: Int!
        items: [User]!
    }

`;

const queries = `
    type Query {
        userSearch(filter: [FilterInput!]!, limit: Int, skip: KeyInput, sort: SortInput!): UserPagination!
    }
`;

const mutations = `
    type Mutation {
        tokenRequest(email: String!): Boolean!
        tokenValidate(validate: ValidadeInput!): Secret!

        userPut(user: UserInput!): User
    }
`;

module.exports = `
  ${types}
  ${queries}
  ${mutations}
`;

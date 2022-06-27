const types = `

  type Key {
    id: String!
    type: String!
    createdIn: Float!
  }

  type Plan {
    id: ID!
    title: String!
    description: String
    externalId: String
    pack: String
    offer: Float!
    amount: Float!
    unit: String
    createdIn: Float!
  }

`;

const inputs = `
  enum SortDir {
    asc
    desc
  }

  enum FilterType {
    S
    B
    N
  }

  enum FilterOperator {
    startswith
    contains
    in
    between
    eq
    neq
    gt
    gte
    lt
    lte
    isnotnull
    isnull
  }

  input SortInput {
    dir: SortDir!
  }
  
  input FilterInput {
    type: FilterType
    field: String!
    value: String!
    operator: FilterOperator
    isKey: Boolean
  }

  input KeyInput {
    id: String!
    type: String!
    createdIn: Float!
  }

`;

const queries = `
  type Query {
    planList: [Plan]
  }
`;

const mutations = `
  type Mutation {
    configure: Boolean!
  }
`;

module.exports = `
  ${types}
  ${inputs}
  ${queries}
  ${mutations}
`;

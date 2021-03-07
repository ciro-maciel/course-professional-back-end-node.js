const {
  persistence: { UnitOfWork, databases },
} = require("@ciro-maciel/utility/clients/backend");

const { TABLE_NAME } = process.env;

const uow = new UnitOfWork(new databases.Dynamo(), TABLE_NAME);

module.exports = {
  Query: {
    planList: async (_) => {
      const plans = await uow.repository().filter({
        indexName: "GSI_TYPE",
        filter: [
          {
            type: "S",
            field: "type",
            value: "plan",
          },
        ],
        sort: { field: "amount", dir: "asc" },
      });

      return plans.items;
    },
  },
  Mutation: {
    configure: async (_) => {
      try {
        // https://vendors.paddle.com/subscriptions/plans
        // id === Plan ID
        const plans = [
          {
            id: "001001",
            type: "plan",
            title: "common:1b52cdb.d5178c0.d",
            description: "common:1b52cdb.d5178c0.v",
            amount: 0,
            offer: 0,
            unit: "month",
            createdIn: new Date().getTime(),
          },
          {
            id: "639025",
            type: "plan",
            title: "common:1b52cdb.d0ac567.d",
            description: "common:1b52cdb.d0ac567.v",
            amount: 4,
            offer: 1.99,
            unit: "month",
            createdIn: new Date().getTime(),
          },
          {
            id: "639026",
            type: "plan",
            title: "common:1b52cdb.3c37a84.d",
            description: "common:1b52cdb.3c37a84.v",
            amount: 10,
            offer: 4.99,
            unit: "month",
            createdIn: new Date().getTime(),
          },
          {
            id: "639027",
            type: "plan",
            title: "common:1b52cdb.67e713d.d",
            description: "common:1b52cdb.67e713d.v",
            amount: 22,
            offer: 10.99,
            unit: "month",
            createdIn: new Date().getTime(),
          },
        ];

        await Promise.all(
          plans.map(async (plan) => {
            return !!(await uow.repository().put(plan));
          })
        );

        return true;
      } catch (error) {
        throw error;
      }
    },
  },
};

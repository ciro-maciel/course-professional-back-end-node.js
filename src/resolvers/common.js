const {
  persistence: { UnitOfWork, databases },
} = require("@rili-saas/utility/clients/backend");

const { TABLE_NAME } = process.env;

const uow = new UnitOfWork(new databases.Dynamo(), TABLE_NAME);

module.exports = {
  Query: {
    planList: async (_) => {
      const plans = await uow.repository().filter({
        indexName: "GSI_TYPE",
        filter: [
          {
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
        const plans = [
          {
            id: "e32e680bcc86928c",
            type: "plan",
            title: "Free",
            description: JSON.stringify([
              { name: "Pages", value: "5" },
              { name: "Pages Customization" },
              { name: "Google Analytics" },
              { name: "Facebook pixel" },
            ]),
            externalId: '',
            amount: 0,
            offer: 0,
            unit: "month",
            createdIn: new Date().getTime(),
          },
          {
            id: "4f149cf0940ca64f",
            type: "plan",
            title: "Maker",
            description: JSON.stringify([
              { name: "Pages", value: "10" },
              { name: "Pages Customization" },
              { name: "Get found easier with SEO" },
              { name: "Google Analytics" },
              { name: "Facebook pixel" },
              { name: "Custom Domain" },
              { name: "Security with SSL" },
            ]),
            externalId: '',
            amount: 4,
            offer: 1.99,
            unit: "month",
            createdIn: new Date().getTime(),
          },
          {
            id: "f19c01cdb16fe50a",
            type: "plan",
            title: "Startup",
            description: JSON.stringify([
              { name: "Pages", value: "20" },
              { name: "Pages Customization" },
              { name: "Get found easier with SEO" },
              { name: "Google Analytics" },
              { name: "Facebook pixel" },
              { name: "Custom Domain" },
              { name: "Remove Pages Branding" },
              { name: "Security with SSL" },
            ]),
            externalId: '',
            amount: 10,
            offer: 4.99,
            unit: "month",
            createdIn: new Date().getTime(),
          },
          {
            id: "d45dabefa6b0eaad",
            type: "plan",
            title: "Business",
            description: JSON.stringify([
              { name: "Pages", value: "30" },
              { name: "Pages Customization" },
              { name: "Get found easier with SEO" },
              { name: "Google Analytics" },
              { name: "Facebook pixel" },
              { name: "Custom Domain" },
              { name: "Remove Pages Branding" },
              { name: "Security with SSL" },
              { name: "Priority Support" },
            ]),
            externalId: '',
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
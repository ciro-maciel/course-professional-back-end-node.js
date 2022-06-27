const utility = require("@rili-saas/utility");
const {
  management: { authentication },
  persistence: { UnitOfWork, databases },
} = require("@rili-saas/utility/clients/backend");

const Identicon = require("identicon.js");
const jwt = require("jsonwebtoken");

const { email } = require("../services");

const uow = new UnitOfWork(new databases.Dynamo(), process.env.TABLE_NAME);

module.exports = {
  Query: {
    accountById: authentication.validate(async (_, { id }) => {
      return await uow.repository().findByKey({ id });
    }),
  },
  Mutation: {
    tokenRequest: async (_, { email }) => {
      try {
        let account = await uow.repository().filter({
          indexName: "GSI_TYPE",
          filter: [
            {
              field: "type",
              value: "account",
            },
            {
              field: "email",
              value: email,
            },
          ],
        });

        if (account.items.length === 0) {

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

          account = {
            id: utility.math.guid(16, 16),
            type: "account",
            email,
            photo: `data:image/svg+xml;base64,${new Identicon(
              utility.math.guid(16, 16),
              {
                size: 256,
                format: "svg",
              }
            ).toString()}`,
            security: JSON.stringify({
              twoFactor: false,
            }),
            history: JSON.stringify([]),
            financial: JSON.stringify({
              plan: plans.items[0],
              dueAt: new Date().getTime(),
              payments: []
            }),
            deletedIn: null,
            createdIn: new Date().getTime(),
          };

        } else {
          account = account.items[0];
        }

        const token = {
          value: utility.math.guid(16, 16),
          action: "token-request",
          createdIn: new Date().getTime(),
        };

        account.history = JSON.parse(account.history);
        account.history.push(token);
        account.history = JSON.stringify(account.history);

        account.security = JSON.parse(account.security);
        account.security.token = token;
        account.security = JSON.stringify(account.security);


        email.send(
          email,
          `${process.env.APP_NAME} - Your Temporary Login Code`,
          `You code is ${token.value}`
        );

        return !!(await uow.repository().put(account));
      } catch (error) {
        throw error;
      }
    },
    tokenValidate: async (_, { validate }) => {
      try {
        let account = await uow.repository().filter({
          indexName: "GSI_TYPE",
          filter: [
            {
              field: "type",
              value: "account",
            },
            {
              field: "email",
              value: validate.email,
            },
          ],
        });

        if (account.items.length > 0) {
          account = account.items[0];

          if (!account.deletedIn) {
            account.security = JSON.parse(account.security);

            if (account.security.token.value === validate.token) {
              account.security.token = null;
              account.security = JSON.stringify(account.security);

              account.history = JSON.parse(account.history);
              account.history.push({
                action: validate.type,
                createdIn: new Date().getTime(),
                netInfo: JSON.parse(validate.netInfo),
              });
              account.history = JSON.stringify(account.history);

              await uow.repository().put(account);

              delete account.history;
              delete account.security;

              const token = jwt.sign({ id: account.id }, process.env.JWT_SECRET, {
                expiresIn: "920h",
              });

              return {
                code: 200,
                ...(validate.type === "auth" && { account, value: token }),
              };
            } else {
              return {
                code: 401,
              };
            }
          } else {
            return {
              code: 410,
            };
          }
        } else {
          return {
            code: 404,
          };
        }
      } catch (error) {
        throw error;
      }
    },
    accountDisable: authentication.validate(async (_, { id }) => {
      try {
        let account = await uow.repository().findByKey({ id });
        account.deletedIn = new Date().getTime();

        return !!(await uow.repository().put(account));
      } catch (error) {
        throw error;
      }
    }),
  },
};

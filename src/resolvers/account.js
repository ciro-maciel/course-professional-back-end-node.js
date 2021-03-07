const utility = require("@ciro-maciel/utility/dist/utility.cjs");
const {
  management: { authentication },
  persistence: { UnitOfWork, databases },
} = require("@ciro-maciel/utility/dist/backend");

const jwt = require("jsonwebtoken");

const { sendEmail } = require("../services");
const utils = require("../utils");

const { TABLE_NAME, SECRET, APP_NAME } = process.env;

const uow = new UnitOfWork(new databases.Dynamo(), TABLE_NAME);

module.exports = {
  Query: {
    accountGet: authentication.validate(async (_, { id }) => {
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
              type: "S",
              field: "type",
              value: "account",
            },
            {
              type: "S",
              field: "email",
              value: email,
            },
          ],
        });

        const token = {
          value: utility.math.guid(16, 16),
          action: "token-request",
          createdIn: new Date().getTime(),
        };

        account =
          account.count !== 0 ? account.items[0] : utils.account.create(email);

        account.security.token = token;

        sendEmail(
          email,
          `Seu Código de Login Temporário ${APP_NAME}`,
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
              type: "S",
              field: "type",
              value: "account",
            },
            {
              type: "S",
              field: "email",
              value: validate.email,
            },
          ],
        });

        if (account) {
          account = account.items[0];

          if (!account.deletedIn) {
            if (account.security.token.value === validate.token) {
              account.security.token = null;

              account.history.push({
                action: validate.type,
                createdIn: new Date().getTime(),
                netInfo: validate.netInfo,
              });

              await uow.repository().put(account);

              delete account.history;
              delete account.security;

              const token = jwt.sign({ id: account.id }, SECRET, {
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
    accountPut: authentication.validate(async (_, { account: accountPut }) => {
      try {
        let account = await uow.repository().findByKey({ id: accountPut.id });

        return !!(await uow.repository().put({ ...account, ...accountPut }));
      } catch (error) {
        throw error;
      }
    }),
  },
};

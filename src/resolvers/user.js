const { UnitOfWork, databases } = require("../persistence");
const { authentication } = require("../management");

const jwt = require("jsonwebtoken");
const utility = require("@ciro-maciel/utility");

const { sendEmail } = require("../services");
const utils = require("../utils");

const { TABLE_NAME, SECRET } = process.env;

const uow = new UnitOfWork(new databases.Dynamo(), TABLE_NAME);

module.exports = {
  Query: {
    userById: authentication.validate(async (_, { id }) => {
      let user = await uow.repository().findByKey({ id });

      if (user) {
        user.userName = await getUserName(id);
      }

      return user;
    }),
    userByUserName: authentication.validate(async (_, { userName }) => {
      // primeiro vou fazer a pesquisa para o userName
      let userNameResult = await uow.repository().filter({
        indexName: "GSI_TYPE",
        filter: [
          {
            field: "type",
            value: "username",
          },
          {
            field: "value",
            value: userName,
          },
        ],
        sort: {
          field: "createdIn",
          dir: "desc",
        },
      });

      // se eu encontro
      if (userNameResult.count > 0) {
        // vou procurar todos os userNames do usuario
        userNameResult = await uow.repository().filter({
          indexName: "GSI_TYPE",
          filter: [
            {
              field: "type",
              value: "username",
            },
            {
              field: "user",
              value: userNameResult.items[0].user,
            },
          ],
          sort: {
            field: "createdIn",
            dir: "desc",
          },
        });

        const user = await uow
          .repository()
          .findByKey({ id: userNameResult.items[0].user });

        return { ...user, userName: userNameResult.items[0].value };
      } else {
        // tentativa de get by ID
        return await uow.repository().findByKey({ id: userName });
      }
    }),
  },
  Mutation: {
    tokenRequest: async (_, { email }) => {
      try {
        let user = await uow.repository().filter({
            indexName: "GSI_TYPE",
            filter: [
              {
                type: "S",
                field: "type",
                value: "user",
              },
              {
                type: "S",
                field: "email",
                value: email,
              },
            ],
          }),
          token = {
            value: utility.math.guid(16, 16),
            action: "token-request",
            createdIn: new Date().getTime(),
          };

        if (user.count !== 0) {
          user = user.items[0];

          if (user.security.invited) {
            // o usuario é criado em participants como o parametro invited
            user.history.push({
              action: "invited",
              createdIn: user.security.invited,
            });
            delete user.security.invited;
          }

          user.security.token = token;
        } else {
          user = utils.user.create(email, token);
        }

        sendEmail(
          email,
          "Seu Código de Login Temporário Workspace",
          `You code is ${token.value}`
        );

        return !!(await uow.repository().put(user));
      } catch (error) {
        throw error;
      }
    },
    tokenValidate: async (_, { validate }) => {
      try {
        let user = await uow.repository().filter({
          indexName: "GSI_TYPE",
          filter: [
            {
              type: "S",
              field: "type",
              value: "user",
            },
            {
              type: "S",
              field: "email",
              value: validate.email,
            },
          ],
        });

        if (user.count > 0) {
          user = user.items[0];

          if (!user.deletedIn) {
            if (user.security.token.value === validate.token) {
              user.userName = await getUserName(user.id);
              user.security.token = null;

              user.history.push({
                action: validate.type,
                createdIn: new Date().getTime(),
                netInfo: validate.netInfo,
              });

              await uow.repository().put(user);

              delete user.history;
              delete user.security;

              const token = jwt.sign({ id: user.id }, SECRET, {
                expiresIn: "920h",
              });

              return {
                code: 200,
                ...(validate.type === "auth" && { user, value: token }),
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
    userUpdate: authentication.validate(async (_, { user: userUpdated }) => {
      let user = await uow.repository().findByKey({ id: userUpdated.id });

      // se o usuario vai receber um novo nome de usario
      // vou guardar na tabela de historico
      if (userUpdated.userName && userUpdated.userName !== user.userName) {
        const userName = {
          id: utility.math.guid(16, 16),
          type: "username",
          createdIn: new Date().getTime(),
          value: userUpdated.userName,
          user: user.id,
        };

        // apago o campo para nao guarda no obj
        let userField = userUpdated;
        delete userField.userName;

        await uow.repository().put(userName);
      }

      user = { ...user, ...userUpdated };

      await uow.repository().put(user);

      return user;
    }),
    userDelete: authentication.validate(async (_, { id }) => {
      let user = await uow.repository().findByKey({ id });

      user.deletedIn = new Date().getTime();

      return await uow.repository().put(user);
    }),
  },
};

const getUserName = async (id) => {
  const userName = await uow.repository().filter({
    indexName: "GSI_TYPE",
    filter: [
      {
        field: "type",
        value: "username",
      },
      {
        field: "user",
        value: id,
      },
    ],
    sort: {
      field: "createdIn",
      dir: "desc",
    },
  });

  return userName.count > 0 ? userName.items[0].value : "";
};

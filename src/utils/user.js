const { utility } = require("@ciro-maciel/utility");

module.exports = {
  create: (email) => {
    return {
      id: utility.math.guid(16, 16),
      type: "user",
      email,
      security: {
        twoFactor: false,
      },
      history: [],
      deletedIn: null,
      createdIn: new Date().getTime(),
    };
  },
};

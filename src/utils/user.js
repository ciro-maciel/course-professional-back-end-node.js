const Identicon = require("identicon.js");
const utility = require("@ciro-maciel/utility");

module.exports = {
  create: (email, token, invited) => {
    return {
      id: utility.math.guid(16, 16),
      type: "user",
      email,
      photo: `data:image/svg+xml;base64,${new Identicon(
        utility.math.guid(16, 16),
        {
          size: 256,
          format: "svg",
        }
      ).toString()}`,
      security: {
        ...(invited && { invited: new Date().getTime() }),
        twoFactor: false,
        ...(token && { token }),
      },
      history: [],
      deletedIn: null,
      createdIn: new Date().getTime(),
    };
  },
};

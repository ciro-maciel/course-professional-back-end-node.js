const { SES } = require("aws-sdk");

const { APP_NAME } = process.env;

const ses = new SES({
  region: "us-east-1",
});

const send = async (to, subject, textMessage, htmlMessage) => {
  return new Promise(async (resolve, reject) => {
    //https://dev.to/adnanrahic/building-a-serverless-contact-form-with-aws-lambda-and-aws-ses-4jm0
    // https://docs.aws.amazon.com/ses/latest/DeveloperGuide/examples-send-using-sdk.html
    const charset = "UTF-8";

    var params = {
      Source: `RiLi Team from ${APP_NAME} <team@rili.be>`,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: charset,
        },
        Body: {
          ...(textMessage && { Text: { Data: textMessage, Charset: charset } }),
          ...(htmlMessage && { Html: { Data: htmlMessage, Charset: charset } }),
        },
      },
    };

    try {
      return !!(await ses.sendEmail(params).promise());
    } catch (error) {
      return false;
    }
  });
};

module.exports = { send };

const { SES } = require("aws-sdk");

const { APP_NAME } = process.env;

const ses = new SES({
  region: "us-east-1",
});

const sendEmail = (to, subject, message) => {
  return new Promise((resolve, reject) => {
    //https://dev.to/adnanrahic/building-a-serverless-contact-form-with-aws-lambda-and-aws-ses-4jm0
    // https://docs.aws.amazon.com/ses/latest/DeveloperGuide/examples-send-using-sdk.html
    const charset = "UTF-8";

    var params = {
      Source: `Ciro from ${APP_NAME} <me@ciro-maciel.me>`,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: charset,
        },
        Body: {
          Text: {
            Data: message,
            Charset: charset,
          },
          // Html: {
          //   Data: body_html,
          //   Charset: charset
          // }
        },
      },
    };

    ses.sendEmail(params, function (err, data) {
      return err ? reject(err.message) : resolve(data.MessageId);
    });
  });
};

module.exports = { sendEmail };

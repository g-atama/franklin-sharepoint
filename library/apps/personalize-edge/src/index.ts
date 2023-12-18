import { APIGatewayProxyEventV2, Context } from "aws-lambda";

const content = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Simple Lambda@Edge Static Content Response</title>
  </head>
  <body>
    <p>Hello from Lambda@Edge!</p>
  </body>
</html>
`;

export const handler = async (
  // eslint-disable-next-line no-unused-vars
  event: APIGatewayProxyEventV2,
  // eslint-disable-next-line no-unused-vars
  context: Context
): Promise<any> => {
  const response = {
    status: "200",
    statusDescription: "OK",
    headers: {
      "cache-control": [
        {
          key: "Cache-Control",
          value: "max-age=100",
        },
      ],
      "content-type": [
        {
          key: "Content-Type",
          value: "text/html",
        },
      ],
    },
    body: content,
  };

  return response;
};

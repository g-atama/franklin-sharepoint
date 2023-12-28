export const handler = (event: any, context: unknown, callback: any) => {
  console.log("event", JSON.stringify(event));
  console.log("context", JSON.stringify(context));
  console.log("callback", JSON.stringify(callback));
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  const headerNameSrc = "X-Amz-Meta-Last-Modified";
  const headerNameDst = "Last-Modified";

  headers["cache-control"] = [
    {
      key: "Cache-Control",
      value: "public, s-maxage=10, max-age=5, stale-while-revalidate=10",
    },
  ];

  headers["content-type"] = [
    {
      key: "Content-Type",
      value: "text/html; charset=utf-8",
    },
  ];

  if (headers[headerNameSrc.toLowerCase()]) {
    headers[headerNameDst.toLowerCase()] = [
      headers[headerNameSrc.toLowerCase()][0],
    ];
    console.log(
      `Response header "${headerNameDst}" was set to ` +
        `"${headers[headerNameDst.toLowerCase()][0].value}"`
    );
  }

  callback(null, response);
};

// eslint-disable-next-line no-unused-vars
function handler(event: any, context: unknown, callback: any) {
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
}

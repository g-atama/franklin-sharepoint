import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: "us-east-2" });

export const handler = async (event: unknown) => {
  console.log(event);
  const data = await s3.send(
    new ListObjectsCommand({
      Bucket: `sandbox-arc-edge-cache-bucket`,
    })
  );
  console.log(JSON.stringify(data.Contents));
  return data.Contents;
};

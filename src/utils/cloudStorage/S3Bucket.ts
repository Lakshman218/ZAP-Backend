import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// const bucketName = process.env.BUCKET_NAME as string;
// const region = process.env.BUCKET_REGION as string;
// const accessKeyId = process.env.ACCESS_KEY as string;
// const secretAccessKey = process.env.SECRET_KEY as string;

const bucketName = 'zap-users-chat-files'
const region = 'ap-south-1'
const accessKeyId = 'AKIA4CBA6FAE6YYPXS4D'  
const secretAccessKey = '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'

console.log(bucketName, region, accessKeyId, secretAccessKey);

const s3Client = new S3Client({
  region,
  credentials: {
      accessKeyId,
      secretAccessKey
  }
});

export const s3Upload = async (file: any) => {
  const params:any = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(params));

  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${file.originalname}`;

  return url;
};

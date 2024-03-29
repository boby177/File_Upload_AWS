const { S3 } = require("aws-sdk");
const uuid = require("uuid").v4;

// setup  AWS data bucket configuration
exports.s3Uploadv2 = async (file) => {
  const s3 = new S3();

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${uuid()}-${file.originalname}`,
    Body: file.buffer,
  };
  return await s3.upload(param).promise();
};

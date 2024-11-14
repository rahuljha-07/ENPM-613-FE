import AWS from 'aws-sdk';

// Directly set AWS configuration for testing
const s3 = new AWS.S3({
  accessKeyId: 'AKIAZ5TC42XDNZ2UZRU5',
  secretAccessKey: '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',
  region: 'us-east-2',
  signatureVersion: 'v4',
});

const BUCKET_NAME = 'ilim-assets';

/**
 * Uploads a file to S3, replacing it if it already exists.
 * @param {Buffer | ReadableStream} fileData - The file data.
 * @param {string} fileName - The name of the file.
 * @returns {string} - The URL of the uploaded file.
 */
export const uploadFileToS3 = async (fileData: Buffer | ReadableStream, fileName: string): Promise<string> => {
  if (!BUCKET_NAME) {
    throw new Error("Bucket name is not defined");
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileData,
    // ACL: 'public-read', // Allows the file to be accessed publicly
  };

  // Check if file exists
  try {
    console.log("Uploading to bucket:", BUCKET_NAME);
    await s3.headObject({ Bucket: BUCKET_NAME, Key: fileName }).promise();
    // If it exists, replace it
    await s3.putObject(params).promise();
  } catch (err: any) {
    if (err.code === 'NotFound') {
      // If not found, upload it
      await s3.upload(params).promise();
    } else {
      throw err;
    }
  }

  // Return a public URL that does not expire
  return `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${fileName}`;
};

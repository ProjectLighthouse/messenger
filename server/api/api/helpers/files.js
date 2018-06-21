
const AWS = require('aws-sdk');
const request = require('request-promise');
const url = require('url');

const { logger } = require('../../helpers/log');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const uuidv1 = require('uuid/v1');

const defaultFilePath = process.env.S3_BUCKET_PATH || 'public';

function createRandomFileName() {
  return uuidv1();
}

function isValidUrl(urlToValidate) {
  const urlObject = url.parse(urlToValidate);
  return (
    urlObject.protocol &&
    urlObject.host
 );
}

module.exports = {
  uploadFileToBucket(fileName, fileText, contentType) {
    const uploadParams = {
      ContentType: contentType,
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body: fileText,
    };

    return s3.upload(uploadParams).promise()
    .then(data => {
      if (!data.Location) {
        throw new Error('Cannot push file to S3 for unknown reason');
      }

      return true;
    });
  },

  uploadImageToBucket(imageUrl, filePath) {
    return request({
      url: imageUrl,
      resolveWithFullResponse: true,
      headers: { 'user-agent': 'Mozilla/5.0' },
      encoding: null,
    })
    .catch((e) => {
      const message = `Cannot pull image ${imageUrl} with response: ${e.message}`;
      logger.error(message);
    })
    .then((res) => {
      const bucketFilePath = filePath || defaultFilePath;
      const fileName = createRandomFileName();

      return module.exports.uploadFileToBucket(
        `${bucketFilePath}/${fileName}`,
        res.body,
        res.headers['content-type']
      )
      .then(() => fileName);
    });
  },

  uploadImagesFromObject(object, stubImageUpload = false) {
    const FIELDS_WITH_IMAGES = ['bannerImage', 'logo', 'profileImage'];


    return Promise.all(FIELDS_WITH_IMAGES.map((field) => {
      const urlFromObject = object[field];

      if (urlFromObject) {
        if (stubImageUpload) {
          delete object[field];
          object[field] = module.exports.createRandomFileName();
          return Promise.resolve(object);
        }

        if (!isValidUrl(urlFromObject)) {
          return Promise.resolve();
        }

        return module.exports.uploadImageToBucket(urlFromObject)
        .then((fileName) => {
          delete object[field];
          object[field] = fileName;
        });
      }

      return Promise.resolve();
    }))
    .catch((e) => {
      logger.error(`Cannot push image(s) to s3 with error ${e.message}`);
    });
  },

  createRandomFileName,
};

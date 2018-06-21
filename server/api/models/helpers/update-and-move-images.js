const RemoveImageLog = require('../remove-image-log');

module.exports = function updateAndMoveImages(fields, query, setObject) {
  return this
    .findOne(query)
    .then((item) => {
      if (!item) {
        return null;
      }
      const fieldsFiltered = fields.filter((field) => {
        if (Object.keys(setObject).indexOf(field) === -1) {
          return false;
        }
        if (setObject[field] === item[field]) {
          return false;
        }
        return true;
      });

      const imageLogs = fieldsFiltered.map(field =>
         ({
           collectionName: this.modelName,
           oldImage: item[field],
           field,
           status: 'pending',
         })
      );

      return new Promise((resolve, reject) => {
        if (!imageLogs.length) {
          return resolve([]);
        }

        return RemoveImageLog
          .collection
          .insert(imageLogs, {}, (error, success) => {
            if (error) {
              reject(error);
            } else {
              resolve(success);
            }
          });
      });
    })
    .then(() =>
       this.update(query, setObject)
    );
};

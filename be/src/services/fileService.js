const File = require('../models/file')


exports.read = (data) => {
  return File.find({ channel: data });
}
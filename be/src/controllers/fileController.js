const fileService = require('../services/fileService');
const { STATUS, REQUEST, METHOD } = require('../constants/chat');

exports.read = async (socket, data) => {
  try {
    const files = await fileService.read(data);
    console.log(files)
    socket.emit(`${REQUEST.FILE}_${METHOD.READ}`, STATUS.ON, files);
  } catch (err) {
    socket.emit(`${REQUEST.FILE}_${METHOD.READ}`, STATUS.FAILED, { ...data, message: err.message });
  }
}
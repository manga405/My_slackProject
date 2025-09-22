exports.sendToUsers = (socketList, userIds, message, status, data) => {
    userIds.forEach(userId => {
        socketList[String(userId._id)]?.forEach(socket => socket.emit(message, status, data));
    })
}
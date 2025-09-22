import { createContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { REQUEST, METHOD, STATUS } from "../constants/chat";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {

  const localToken = localStorage.getItem('token')

  const socket = useMemo(() => io(`${process.env.REACT_APP_BASE_URL}`, { extraHeaders: { token: localToken } }), [localToken]);
  const [isConnected, setIsConnected] = useState(false);
  const [channelContentState, setChannelContentState] = useState('messageOpened')
  const [users, setUsers] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([]);



  socket.on('connect', () => {
    setIsConnected(true);
  });

  socket.on('disconnect', () => {
    setIsConnected(false);
  });

  const getUsers = (status, data) => {
    if (status == STATUS.ON) {
      setUsers(data);
    }
  }

  useEffect(() => {
    socket.emit(REQUEST.AUTH, localToken);
    socket.emit(`${REQUEST.AUTH}_${METHOD.READ}`)
    socket.on(`${REQUEST.AUTH}_${METHOD.READ}`, getUsers)
    return () => {
      socket.off(`${REQUEST.AUTH}_${METHOD.READ}`, getUsers)
    }
  }, [localToken]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        socket,
        channelContentState, setChannelContentState, users, setUsers, selectedFiles, setSelectedFiles
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;

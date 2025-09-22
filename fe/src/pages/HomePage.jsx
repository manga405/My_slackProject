import { Avatar, AvatarBadge, Box, Button, CloseButton, Divider, Flex, HStack, Input, Popover, Spinner, Text, VStack } from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ImHome, ImEye } from "react-icons/im";
import { useLocation, useNavigate } from "react-router-dom";
import ChannelHeader from "../components/ChannelHeader";
import CreateChannelModal from "../components/CreateChannelModal";
import Messages from "../components/Messages";
import { METHOD, REQUEST, STATUS } from "../constants/chat";
import { SocketContext } from "../context/SocketProvider";
// import useUser from "../api/useUsers";
import useAuth from "../api/useAuth";
import { FaSignOutAlt, FaPlusCircle, FaChevronRight, FaChevronDown, FaFile, FaDownload } from 'react-icons/fa'
import { BsFillPinAngleFill, BsFillPinFill, BsChatSquareTextFill, BsPersonPlusFill } from 'react-icons/bs'
import CreateDMModal from "../components/CreateDMModal";
import Axios from "../libs/api";
import axios from "axios";


const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState({})
  // const { users } = useUser()

  const [userList, setUserList] = useState([])
  const { socket, channelContentState, setChannelContentState, users } = useContext(SocketContext);
  const [channelId, setChannelId] = useState();
  const [messageId, setMessageId] = useState();
  const [channels, setChannels] = useState([]);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showCreateDMModal, setShowCreateDMModal] = useState(false)

  const [avatarSetBox, setAvatarSetBox] = useState(true)
  const [channelListState, setChannelListState] = useState(true);
  const [DMListState, setDMListState] = useState(true);
  const [files, setFiles] = useState([])

  const [userStatus, setUserStatus] = useState('');

  const channel = useMemo(
    () => {
      const channel = channels.find(channel => channel._id == channelId);
      if (!channel && channels.length > 0) {
        navigate(`/home/?channel=${channels[0]._id}`)
      }
      return channel;
    },
    [channels, channelId]
  );

  const getAuth = async () => {
    const token = localStorage.getItem('token')
    const result = await Axios({
      url: `${process.env.REACT_APP_BASE_URL}/auth/check?token=${token}`,
      method: 'GET',
    });

    setAuth(result.data)
  }

  useEffect(() => {
    getAuth()
    socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`);
  }, [])

  useEffect(() => {
    users.map(value => {
      if (value._id === auth.id) {
        if (value.status === 'offline') setUserStatus('#ff0000ff')
        if (value.status === 'online') setUserStatus('#1aff00ff')
        if (value.status === 'sleep') setUserStatus('#101010ff')
      }
    })
  }, [users, auth])

  const setStatus = (data) => {
    socket.emit(`${REQUEST.AUTH}_${METHOD.UPDATE}`, { status: data });
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setChannelId(params.get('channel'));
    setMessageId(params.get('message'));
  }, [location]);

  const onCreateChannel = (status, data) => {
    if (status == STATUS.ON) {
      setChannels(prev => [...prev, data]);
    }
  }

  // const onReadChannels = useCallback((status, data) => {
  //   if (status == STATUS.ON) {
  //     setChannels(data);
  //   }
  // }, [])asdfasdfasdfasdf
  const onReadChannels = (status, data) => {
    if (status == STATUS.ON) {
      setChannels(data);
    }
  }

  const getFiles = (status, data) => {
    if (status == STATUS.ON) {
      console.log(data)
      setFiles(data);
    }
  }

  const onUpdateChannel = (status, data) => {
    if (status == STATUS.ON) {
      setChannels((prev) => prev.map(channel => channel._id == data._id ? data : channel));
    }
  }

  const onDeleteChannel = (status, data) => {
    if (status == STATUS.ON) {
      setChannels((prev) => prev.filter(channel => channel._id != data.id));
    }
  }

  useEffect(() => {
    socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`);
    socket.on(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, onCreateChannel);
    socket.on(`${REQUEST.CHANNEL}_${METHOD.READ}`, onReadChannels);
    socket.on(`${REQUEST.CHANNEL}_${METHOD.UPDATE}`, onUpdateChannel);
    socket.on(`${REQUEST.CHANNEL}_${METHOD.DELETE}`, onDeleteChannel);
    return () => {
      socket.removeListener(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, onCreateChannel);
      socket.removeListener(`${REQUEST.CHANNEL}_${METHOD.READ}`, onReadChannels);
      socket.removeListener(`${REQUEST.CHANNEL}_${METHOD.UPDATE}`, onUpdateChannel);
      socket.removeListener(`${REQUEST.CHANNEL}_${METHOD.DELETE}`, onDeleteChannel);
    }
  }, [users, auth]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/')
  }

  useEffect(() => {
    if (Object.keys(auth)?.length == 0 && localStorage.getItem('token')) navigate('/');
    navigate(`/home/?channel=${channels[0]?._id}`)
  }, [auth])

  useEffect(() => {
    if (channelContentState === 'fileOpened')
      socket.emit(`${REQUEST.FILE}_${METHOD.READ}`, channelId)
    socket.on(`${REQUEST.FILE}_${METHOD.READ}`, getFiles)
    return () => {
      socket.off(`${REQUEST.FILE}_${METHOD.READ}`)
    }
  }, [channelContentState])


  const onDownload = async (file) => {
    // const response = await axios.get(`http://localhost:8080/file/:${file}`);
    try {
      // 1. Make the GET request with axios, setting the responseType to 'blob'
      const response = await axios.get(`http://localhost:8080/file/?id=${file._id}`, {
        responseType: 'blob', // Important: this tells axios to handle the response as binary data
        // You can add headers for authentication if needed
        // headers: {
        //   'Authorization': `Bearer ${yourAuthToken}`
        // }
      });

      // 2. Create a Blob from the response data
      const blob = new Blob([response.data]);

      // 3. Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // 4. Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename; // Set the desired filename for the download

      // 5. Append the link and trigger the download
      document.body.appendChild(link);
      link.click();

      // 6. Clean up: remove the link and revoke the URL
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      // Handle download errors gracefully
    }
  };

  return (
    <>
      <Flex h='100vh' w={'100vw'} bg={'#501e50ff'} direction='column' >
        <HStack justifyContent={'center'} bg={'#501e50ff'} p={2} w={'full'}><Input type="search" w={'40%'} h={'28px'} placeholder="Search..............." /></HStack>
        <Flex flex='1 1 0' bg={'#501e50ff'} gridTemplateColumns='repeat(5, minmax(0, 1fr))' paddingRight={'4px'} paddingBottom={'4px'}>
          <VStack w={'60px'} bg={'transparent'}>
            <VStack fontSize={'16px'} color={'#fff'}>
              <Box bg={'#808080ff'} p={2} rounded={10}>
                <ImHome fontSize={'28px'} color="#fff" cursor='pointer' />
              </Box>
              <Text>Home</Text>
            </VStack>

            <Box alignSelf={'center'} position={'absolute'} bottom={2} display={'flex'} gap={3} justifyContent={'center'} alignItems={'center'} onMouseEnter={() => setAvatarSetBox(false)} onMouseLeave={() => setAvatarSetBox(true)} _hover={{ cursor: 'pointer' }} pb={5} zIndex={5}>
              <Avatar w={12} h={12} borderRadius={6} src={process.env.REACT_APP_BASE_URL + '/avatar/' + auth?.avatar} >
                <AvatarBadge insetEnd={1} bottom={0} right={0} border={'2px'} w={'16px'} h={'16px'} bg={userStatus || ''} />
              </Avatar>
              <VStack hidden={avatarSetBox} color={'#fff'} padding={5} rounded={8} w={'fit-content'} fontSize={'20px'} position={'absolute'} bottom={'60%'} left={'60%'} bg={'#3e143eff'}>
                <HStack onClick={() => setStatus('online')} w={'100%'} _hover={{ transform: 'scale(1.1)', cursor: 'pointer' }} >
                  <Box w={4} h={4} border={'2px solid #fff'} rounded={'50%'} bg={'#1aff00ff'} />
                  <Text>online</Text>
                </HStack>
                <HStack onClick={() => setStatus('offline')} w={'100%'} _hover={{ transform: 'scale(1.1)', cursor: 'pointer' }} >
                  <Box w={4} h={4} border={'2px solid #fff'} rounded={'50%'} bg={'#ff0000ff'} />
                  <Text>offline</Text>
                </HStack>
                <HStack onClick={() => setStatus('sleep')} w={'100%'} _hover={{ transform: 'scale(1.1)', cursor: 'pointer' }} >
                  <Box w={4} h={4} border={'2px solid #fff'} rounded={'50%'} bg={'#101010ff'} />
                  <Text>sleep</Text>
                </HStack>
                <Divider />
                <HStack w={'100%'} _hover={{ transform: 'scale(1.1)', cursor: 'pointer' }} onClick={logout} >
                  <FaSignOutAlt />
                  <Text fontSize={16} whiteSpace={'nowrap'}>Log Out</Text>
                </HStack>
              </VStack>
            </Box>

          </VStack>
          <VStack
            w={{ base: '240px', lg: '320px' }}
            h={'calc(100vh - 48px)'}
            gap={1}
            bg={'#693269ff'}
            padding={8}
            position={'relative'}
            align='stretch'
            rounded={10}
          >
            <VStack
              w={'full'}
              h={'92%'}
              gap={1}
              overflowY={'auto'}
              position={'relative'}
              align='stretch'
            >
              <Box display={'flex'} _hover={{ cursor: 'pointer' }} alignItems={'center'} gap={2} pl={5} size='xs' color={'#fff'} onClick={() => setChannelListState(!channelListState)}>
                {
                  channelListState ?
                    <FaChevronDown />
                    :
                    <FaChevronRight />
                }
                <Text>
                  Public channel
                </Text>
              </Box>
              {
                channelListState &&
                <>
                  {channels?.map(channel => (
                    <Flex
                      key={channel._id}
                      p={1}
                      justify='space-between'
                      align='center'
                      rounded={4}
                      cursor='pointer'
                      _hover={{ bg: '#fff2' }}
                      {...(channelId == channel._id && { bg: '#0002' })}
                      onClick={() => {
                        socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`);
                        navigate(`/home/?channel=${channel._id}`)
                      }}
                      hidden={!channel.isPublic && true}
                    >
                      <Text fontSize="sm" color="white">
                        {channel.name}
                      </Text>
                    </Flex>
                  ))}
                </>

              }
              <Box display={'flex'} _hover={{ cursor: 'pointer' }} alignItems={'center'} gap={2} pl={5} size='xs' color={'#fff'} onClick={() => setShowCreateChannelModal(true)}>
                <FaPlusCircle />
                <Text>
                  Create channel
                </Text>
              </Box>

              <Box display={'flex'} paddingTop={8} _hover={{ cursor: 'pointer' }} alignItems={'center'} gap={2} pl={5} size='xs' color={'#fff'} onClick={() => setDMListState(!DMListState)}>
                {
                  DMListState ?
                    <FaChevronDown />
                    :
                    <FaChevronRight />
                }
                <Text>
                  DM
                </Text>
              </Box>

              {
                DMListState &&
                channels?.map((dm, index) => (
                  <Box display={'flex'}
                    gap={3}
                    alignItems={'center'}
                    rounded={5}
                    _hover={{ bg: '#fff2', cursor: 'pointer' }}
                    onClick={() => {
                      socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`);
                      navigate(`/home/?channel=${dm._id}`)
                    }}
                    hidden={(dm.isPublic) ? true : false}
                    key={dm._id}
                  >
                    <Avatar w={10} h={10} borderRadius={6} src={process.env.REACT_APP_BASE_URL + '/avatar/' + (dm.creator?._id == auth?.id ? dm.invited?.avatar : dm.creator?.avatar)} >
                      {(dm.creator?._id == auth?.id ? dm.invited?.status : dm.creator?.status) === 'offline' &&
                        <AvatarBadge insetEnd={1} border={'2px'} right={'0'} w={4} h={4} bg={'#ff0000ff'} />
                      }
                      {(dm.creator?._id == auth?.id ? dm.invited?.status : dm.creator?.status) === 'online' &&
                        <AvatarBadge insetEnd={1} border={'2px'} right={'0'} w={4} h={4} bg={'#1aff00ff'} />
                      }
                      {(dm.creator?._id == auth?.id ? dm.invited?.status : dm.creator?.status) === 'sleep' &&
                        <AvatarBadge insetEnd={1} border={'2px'} right={'0'} w={4} h={4} bg={'#101010ff'} />
                      }
                    </Avatar>
                    <Text color={'#fff'} fontSize={'16px'}>{dm.creator?._id == auth.id ? dm.invited?.email : dm.creator?.email}</Text>
                  </Box>
                ))

              }

              <Box display={'flex'} _hover={{ cursor: 'pointer' }} alignItems={'center'} gap={2} pl={5} size='xs' color={'#fff'} onClick={() => setShowCreateDMModal(true)}>
                <FaPlusCircle />
                <Text>
                  Create DM
                </Text>
              </Box>

            </VStack>


          </VStack>
          {channel ? (
            <VStack flexGrow={1} align="stretch" bg={'#ffffffff'} rounded={10}>
              <ChannelHeader
                borderBottom='1px solid #ccc'
                channel={channel}
              />

              <HStack borderBottom={'1px solid #501e50ff'} textColor={'#501e50ff'} bg={"#fff"} fontSize={16} paddingInline={10} gap={4}>
                <HStack pb={1} _hover={{ cursor: 'pointer', transform: 'scale(1.1)' }} borderBottom={channelContentState == 'messageOpened' ? '3px solid #501e50ff' : ''} onClick={() => setChannelContentState('messageOpened')}>
                  <BsChatSquareTextFill fontSize={'20px'} />
                  <Text>Message</Text>
                </HStack>
                <HStack pb={1} _hover={{ cursor: 'pointer', transform: 'scale(1.1)' }} borderBottom={channelContentState == 'fileOpened' ? '3px solid #501e50ff' : ''} onClick={() => setChannelContentState('fileOpened')}>
                  <FaFile fontSize={'20px'} />
                  <Text>File</Text>
                </HStack>
                <HStack pb={1} _hover={{ cursor: 'pointer', transform: 'scale(1.1)' }} borderBottom={channelContentState == 'pinOpened' ? '3px solid #501e50ff' : ''} onClick={() => setChannelContentState('pinOpened')}>
                  <BsFillPinAngleFill fontSize={'20px'} />
                  <Text>Pin</Text>
                </HStack>
              </HStack>

              <HStack flex='1 1 0'>

                {
                  channelContentState === 'fileOpened' ?
                    <VStack gap={3} flexGrow={1}
                      h='75vh' overflow={'auto'}>
                      {
                        files.length > 0 &&
                        files.map(file => (
                          <Flex key={file._id} bg={'#ffffffff'} border={'1px solid #747474ff'} p={2} borderRadius={5} alignItems={'center'} gap={1}>
                            <Box textColor={'#501e50ff'}>
                              <FaFile />
                            </Box>
                            <Text>{file.originalname}</Text>
                            {
                              file.mimetype.includes('image') &&
                              <Box marginLeft={2} bg={'#ecececff'} _hover={{ cursor: 'pointer', bg: '#bebebeff' }} borderRadius={5} paddingInline={3} paddingBlock={1} textColor={'#501e50ff'} >
                                <ImEye />
                              </Box>
                            }
                            <Box marginLeft={2} bg={'#ecececff'} _hover={{ cursor: 'pointer', bg: '#bebebeff' }} borderRadius={5} paddingInline={3} paddingBlock={1} textColor={'#501e50ff'} onClick={() => onDownload(file)}>
                              <FaDownload />
                            </Box>
                          </Flex>
                        ))
                      }
                    </VStack>
                    :
                    <>
                      <Messages
                        flexGrow={1}
                        h='full'
                        channelId={channelId}
                        messageId={null}
                      />
                      {messageId && (
                        <VStack w={{ base: '50%', lg: '35%' }} h='full' align='stretch' borderLeft='1px solid #ccc'>
                          <HStack px={4} justify='space-between'>
                            <Text>
                              Thread
                            </Text>
                            <CloseButton
                              onClick={() => navigate(`/?channel=${channelId}`)}
                            />
                          </HStack>
                          <Messages
                            h='full'
                            channelId={channelId}
                            messageId={messageId}
                          />
                        </VStack>
                      )}
                    </>
                }

              </HStack>
            </VStack>
          ) : (
            <Flex flexGrow={1} h='full' bg={'#ffffffff'} rounded={10} direction='column' justify='center' align='center' gap={2}>
              <VStack>
                <Spinner />
                <Text fontSize="sm">
                  Loading...
                </Text>
              </VStack>
            </Flex>
          )}
        </Flex>
      </Flex >
      <CreateChannelModal
        isOpen={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        setChannels={setChannels}
      />

      <CreateDMModal
        isOpen={showCreateDMModal}
        onClose={() => setShowCreateDMModal(false)}
        setChannels={setChannels}
      />

    </>
  );
};

export default HomePage;

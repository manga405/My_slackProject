import { Avatar, Badge, Box, Flex, Grid, HStack, Popover, PopoverContent, PopoverTrigger, Text, VStack } from "@chakra-ui/react";
import { useContext, useMemo, useState } from "react";
import { FaEdit, FaRegCommentDots, FaRegSmile, FaRegTrashAlt, FaFile, FaDownload } from "react-icons/fa";
import { BsFillPinAngleFill, BsFillPinFill } from "react-icons/bs";
import { ImEye } from "react-icons/im";
import { Link, useNavigate } from "react-router-dom";
import useUser from "../api/useUsers";
import { METHOD, REQUEST } from "../constants/chat";
import { SocketContext } from "../context/SocketProvider";
import { formatDate, formatTime } from "../utils";
import Emoticon from "./Emoticon";
import Emoticons from "./Emoticons";
import SendMessage from "./SendMessage";
import useAuth from "../api/useAuth";

const Message = ({ showDate, channelId, messageId, message, sender }) => {
  const navigate = useNavigate();
  const { socket, channelContentState, setChannelContentState } = useContext(SocketContext);
  const { users } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [messageHandleBox, setMessageHandleBox] = useState(true)

  const { auth } = useAuth();

  const emoticons = useMemo(() => {
    return message.emoticons.reduce((prev, emoticon) => {
      const group = prev.some(prev => prev.code == emoticon.code);
      if (!group) {
        return [...prev, { code: emoticon.code, users: [emoticon.creator] }];
      }
      return prev.map(group => {
        if (group.code == emoticon.code) {
          return {
            code: emoticon.code,
            users: [...group.users, emoticon.creator],
          }
        }
        return group;
      });
    }, []);
  }, [message]);

  const handleDelete = () => {
    socket.emit(`${REQUEST.MESSAGE}_${METHOD.DELETE}`, { id: message._id });
  }

  const handleEmoticon = (id) => {
    socket.emit(REQUEST.EMOTICON, {
      messageId: message._id,
      emoticonId: id,
    });
  }

  const onPinMessage = () => {
    socket.emit(`${REQUEST.MESSAGE}_${METHOD.PIN}`, { id: message._id });
  }

  return (
    <Box position={'relative'} hidden={((channelContentState == 'pinOpened') && !message.isPined) && true} onMouseEnter={() => setMessageHandleBox(false)}
      onMouseLeave={() => setMessageHandleBox(true)}  >
      {showDate && (
        <Flex justify='center' borderBottom='1px solid #ddd'>
          <Badge mb={-2} variant="outline" bg='white' >
            {formatDate(message.createdAt)}
          </Badge>
        </Flex>
      )}
      <Flex key={message._id} p={2} gap={4} bg={'#e9e4ecff'} rounded={5}

      >
        <Avatar size="sm" borderRadius={8} src={process.env.REACT_APP_BASE_URL + '/avatar/' + sender?.avatar} />
        <VStack flexGrow={1} align='stretch'>
          <Flex direction='column'>
            <Flex gap={4}>
              <Text fontWeight='bold' fontSize='sm'>
                {sender?.email}
              </Text>
              <Text fontSize="sm">
                {formatTime(message.createdAt)}
              </Text>
            </Flex>
            <HStack>
              {
                message.mentions?.map(user => (
                  <Text paddingInline={'8px'} rounded={5} bg={'#96b2ffff'}>@{user.email}</Text>
                ))
              }
            </HStack>
            {isEditing ? (
              <SendMessage
                isEditing
                value={message.message}
                messageId={message._id}
                onClose={() => setIsEditing(false)}
              />
            ) : (
              <Text fontSize="sm">
                {message.message}
              </Text>
            )}
            {message.childCount > 0 && (
              <Link
                to={`/?channel=${channelId}&message=${message._id}`}
              >
                <Text
                  fontSize="sm"
                  color='blue.400'
                  _hover={{ textDecoration: 'underline' }}
                >
                  {message.childCount} replies
                </Text>
              </Link>
            )}
            <HStack>
              {emoticons.map((emoticon, index) => (
                <Box key={index} cursor='pointer'
                  onClick={() => handleEmoticon(emoticon.code)}
                >
                  <Flex align='center' gap={0.5}>
                    <Emoticon id={emoticon.code} />
                    <Text fontSize='xs' color='gray.600'>
                      {emoticon.users.length}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </HStack>
          </Flex>
          <Flex gap={3}>
            {
              message.files.length > 0 &&
              message.files.map(file => (
                <Flex key={file._id} bg={'#ffffffff'} border={'1px solid #747474ff'} p={2} borderRadius={5} alignItems={'center'} gap={1}>
                  <Box textColor={'#501e50ff'}>
                    <FaFile />
                  </Box>
                  <Text>{file.originalname}</Text>
                  {/* {
                    file.mimetype.includes('image') &&
                    <Box marginLeft={2} bg={'#ecececff'} _hover={{ cursor: 'pointer', bg:'#bebebeff' }} borderRadius={5} paddingInline={3} paddingBlock={1} textColor={'#501e50ff'} >
                      <ImEye />
                    </Box>
                  } */}
                  <Box marginLeft={2} bg={'#ecececff'} _hover={{ cursor: 'pointer', bg:'#bebebeff' }} borderRadius={5} paddingInline={3} paddingBlock={1} textColor={'#501e50ff'} >
                    <FaDownload />
                  </Box>
                </Flex>
              ))
            }
          </Flex>
        </VStack>
        <HStack hidden={messageHandleBox} p={2} borderRadius={2} gap={2}  >
          <Popover>
            <PopoverTrigger>
              <Box cursor='pointer'>
                <FaRegSmile />
              </Box>
            </PopoverTrigger>
            <PopoverContent w='unset' p={2}>
              <Grid gap={1} templateColumns='repeat(8, minmax(0, 1fr))'>
                <Emoticons onSelect={handleEmoticon} />
              </Grid>
            </PopoverContent>
          </Popover>
          {messageId == null && (
            <Box cursor='pointer' onClick={() => navigate(`/?channel=${channelId}&message=${message._id}`)}>
              <FaRegCommentDots />
            </Box>
          )}
          {/* <Box cursor='pointer' onClick={() => setIsEditing(true)} >
              <FaEdit />
            </Box> */}
          <Box cursor='pointer' onClick={onPinMessage}>
            {
              message.isPined ?
                <BsFillPinAngleFill />
                :
                <BsFillPinFill />
            }
          </Box>
          {
            sender._id === auth.id &&
            <Box cursor='pointer' onClick={handleDelete} >
              <FaRegTrashAlt color="red" />
            </Box>
          }
        </HStack>
        {
          message.isPined &&
          <Box m={2} color="#1100ffff" bg={'#aea0ffff'} h={'fit-content'} borderRadius={10} paddingInline={2} alignSelf={'center'}>
            pined
          </Box>
        }
      </Flex>
    </Box>
  )
}

export default Message;

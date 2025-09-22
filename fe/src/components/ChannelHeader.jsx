import { Avatar, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useContext, useRef, useState } from "react";
import { FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { METHOD, REQUEST } from "../constants/chat";
import { SocketContext } from "../context/SocketProvider";
import ChannelEditModal from "./ChannelEditModal";
import useAuth from "../api/useAuth";

const ChannelHeader = ({ channel, ...props }) => {
  const { socket } = useContext(SocketContext);
  const { auth } = useAuth()
  const [showChannelEditModal, setShowChannelEditModal] = useState(false);
  const [handleSelectedChannel, setHandleSelectedChannel] = useState(false)

  const handleDeleteChannel = () => {
    socket.emit(`${REQUEST.CHANNEL}_${METHOD.DELETE}`, { id: channel._id });
  }

  return (
    <>
      <Flex p={4} justify='space-between' boxShadow={'0px 0px 10px #fff'} bg={'#e5dbe59a'} color={'#501e50ff'} {...props} margin={4} rounded={8} onMouseEnter={() => setHandleSelectedChannel(true)} onMouseLeave={() => setHandleSelectedChannel(false)}>
        <HStack gap={2}>
          {
            !channel.isPublic ?
              <Avatar w={12} h={12} borderRadius={6} src={process.env.REACT_APP_BASE_URL + '/avatar/' + auth?.avatar} />
              :
              <Text paddingRight={20}>
                # {channel.name}
              </Text>
          }


        </HStack>
        <Flex gap={2} alignItems={'center'}>
          {
            handleSelectedChannel &&
            <Box display={'flex'} gap={3} paddingRight={5} hidden={channel.creator?._id != auth?.id && true} >
              <Box cursor='pointer' onClick={() => setShowChannelEditModal(true)} hidden={!channel.isPublic && true}>
                <FaEdit />
              </Box>
              <Box cursor='pointer' onClick={handleDeleteChannel}>
                <FaRegTrashAlt color="#af1f1fff" />
              </Box>
            </Box>
          }
          <Flex>
            {channel.members.filter((_, index) => index < 4).map(member => (
              <Box ml={-2} key={member._id}>
                <Avatar size="sm" border={'2px solid #fff'} src={process.env.REACT_APP_BASE_URL + '/avatar/' + member.avatar} />
              </Box>
            )
            )}
          </Flex>
          {channel.members.length > 4 && (
            <Text>
              +{channel.members.length - 4}
            </Text>
          )}
        </Flex>
      </Flex>
      <ChannelEditModal
        key={channel._id}
        channel={channel}
        isOpen={showChannelEditModal}
        onClose={() => setShowChannelEditModal(false)}
      />
    </>
  )
}

export default ChannelHeader;

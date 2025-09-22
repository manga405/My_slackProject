import { Box, Button, Checkbox, Divider, Flex, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, VStack } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import useUser from "../api/useUsers";
import { METHOD, REQUEST, STATUS } from "../constants/chat";
import { SocketContext } from "../context/SocketProvider";
import toast from "../utils/toast";
import useAuth from "../api/useAuth";
import { FaSearch } from 'react-icons/fa'


const CreateDMModal = (props) => {
  const { users } = useUser();
  const { auth } = useAuth()

  const { socket } = useContext(SocketContext);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [selectedUser, setSelectedUser] = useState({})

  const [searchedUser, setSearchedUser] = useState([]);
  const [key, setKey] = useState('')


  const handleCreateDM = () => {
    if (Object.keys(selectedUser).length === 0) return
    socket.emit(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, {
      invited: selectedUser._id,
      isPublic: false,
      members: [auth.id, selectedUser._id]
    });
    setIsCreatingChannel(true);
  }

  const onCreateChannel = (status, data) => {
    if (status === STATUS.SUCCESS) {
      setIsCreatingChannel(false);
    } else if (status === STATUS.FAILED) {
      setIsCreatingChannel(false);
      toast.error(data);
    }
  }



  useEffect(() => {
    socket.on(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, onCreateChannel);
    return () => {
      socket.removeListener(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, onCreateChannel);
    }
  }, []);


  useEffect(() => {
    let temp = [...users];
    temp = temp.filter((value) => {
      return value.email.includes(key)
    })
    setSearchedUser(temp)
  }, [key, users])

  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent bg={'#bebebeff'} p={6}>
        <ModalHeader textAlign={'center'} >
          Create DM
        </ModalHeader>
        <ModalBody bg={'#fcfcfcff'} rounded={10} color={'#000000ff'}>
          <VStack gap={4} align='stretch'>
            <Box position={'relative'}>
              <Input
                mt={4}
                borderColor={'#c5c1c5'}
                border={'1px solid black'}
                placeholder="Search User......................"
                size='sm'
                onChange={(e) => setKey(e.target.value)}
              />
              <Box color={'#c5c1c5'} position={'absolute'} right={3} top={'50%'}>
                <FaSearch />
              </Box>
            </Box>
            <VStack gap={1} align='stretch'>
              {searchedUser?.map(user => (
                <Flex
                  key={user._id}
                  p={1}
                  gap={2}
                  rounded={4}
                  cursor='pointer'
                  _hover={{ bg: '#0001' }}
                  onClick={() => setSelectedUser(user)}
                  hidden={auth.email === user.email && true}
                >
                  <Checkbox isChecked={selectedUser._id === user._id} />
                  {user.email}
                </Flex>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter >
          <Button size='sm' isDisabled={isCreatingChannel} onClick={handleCreateDM}>
            {isCreatingChannel ? <Spinner size="sm" /> : <>Create</>}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateDMModal;

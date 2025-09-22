import { Button, Flex, Textarea, Box, Text, VStack, Input, HStack } from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { METHOD, REQUEST } from "../constants/chat";
import { SocketContext } from "../context/SocketProvider";
import { ImFolderPlus } from "react-icons/im";
import toast from "../utils/toast";
import axios from "axios";

const SendMessage = ({ isEditing, channelId, messageId, value, onClose }) => {
  const { socket, users, selectedFiles, setSelectedFiles } = useContext(SocketContext);
  const [mentionedList, setMentionedList] = useState(null);

  const isTyping = useRef(false);
  const textRef = useRef(null);

  const filesRef = useRef()
  const [msgText, setMsgText] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [usersBoxStatus, setUserBoxStatus] = useState(true)




  const handleTyping = () => {
    if (isTyping.current) return;

    isTyping.current = true;

    socket.emit(REQUEST.TYPING, {
      channelId,
      messageId,
    });

    setTimeout(() => {
      isTyping.current = false;
    }, 500);
  };

  const selectMention = (user) => {
    setUserBoxStatus(true)
    textRef.current.focus();
    let temp = [...mentionedList];
    for (let i in temp) {
      if (temp[1] === user._id) return
    }
    temp.push(user._id);
    setMentionedList(temp)
    setMessage((message + user.email + '  '))
  }



  const handleFileChange = (event) => {
    // Transform the FileList into an array of objects for easier state management
    const filesArray = Array.from(event.target.files).map(file => ({
      file,
      name: file.name,
      progress: 0,
    }));
    setSelectedFiles(filesArray);
  };

  const handleUpload = async () => {
    if (selectedFiles.length == 0) {
      setMessage('Please select files first.');
      return { uploadStatus: 'empty' };
    }

    setIsUploading(true);
    setMessage('Uploading files...');

    const uploadPromises = selectedFiles.map(async (fileObject) => {
      const formData = new FormData();
      formData.append('files', fileObject.file);

      formData.append('channel', channelId);


      // Create a promise for each file upload
      return await axios.post('http://localhost:8080/file/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // The onUploadProgress event captures the progress of the upload
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

          // Update the state for the specific file being uploaded
          setSelectedFiles(prevFiles =>
            prevFiles.map(f =>
              f.name === fileObject.name ? { ...f, progress: percentCompleted } : f
            )
          );
        },
      });
    });

    try {
      // Use Promise.all to wait for all file uploads to complete
      const result = await Promise.all(uploadPromises);
      setMessage('All files uploaded successfully!');
      setIsUploading(false);
      return {
        uploadStatus: 'success',
        data: result
      }
    } catch (error) {
      setMessage('File upload failed.');
      setIsUploading(false);
      console.error('Error uploading files:', error);
      return { uploadStatus: 'error' };
    }
  };

  const handleSendMessage = (fileArray) => {
    if (isEditing) {
      socket.emit(`${REQUEST.MESSAGE}_${METHOD.UPDATE}`, {
        id: messageId,
        message: { msgText },
      });
    } else {
      socket.emit(`${REQUEST.MESSAGE}_${METHOD.CREATE}`, {
        channel: channelId,
        parent: messageId || undefined,
        message: msgText || undefined,
        mentions: mentionedList || undefined,
        files: fileArray  || undefined
      });
      setMsgText("");
    }
    onClose?.();
  };

  const handleSend = async () => {

    const result = await handleUpload()
    const fileArray = result.data?.map(file => {
      return file.data
    })

    handleSendMessage(fileArray)


    // if (!msgText && message == 'Please select files first.') return toast.warning("Value of Message or Files is Empty");
    // handleSendMessage();
  }


  return (
    <>
      <Flex paddingInline={4} gap={2} w={'full'} position={'relative'}>
        {selectedFiles.length > 0 && (
          selectedFiles.map((fileObject) => (
            <Box key={fileObject.name} border={'1px solid #cacacaff'} borderRadius={5} padding={1}>
              {fileObject.name}
              <Box className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${fileObject.progress}%` }}
                ></div>
                <span className="progress-bar-text">{fileObject.progress}%</span>
              </Box>
            </Box>
          ))
        )}
      </Flex>
      <>
        <Flex paddingInline={4} gap={4} w={'full'} paddingBottom={6} position={'relative'}>
          <Textarea
            ref={textRef}
            bg={"#fff"}
            value={msgText}
            minH={24}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyUp={(e) => {
              if (e.key == '@') {
                setUserBoxStatus(false)
              }
            }
            }
            onKeyDown={(e) => {
              if (e.key == "Enter" && !(e.shiftKey || e.ctrlKey)) {
                handleSend();
                e.preventDefault();
              }
              if (e.key == "Escape") {
                onClose?.();
              }
              handleTyping();
            }}
          />
          <Box
            display={"flex"}
            color={"#501e50ff"}
            flexDirection={"column"}
            justifyContent={"space-around"}
          >
            <Button w={"full"} bg={"#e2e2daff"} flex="none" onClick={handleSend}>
              <FaPaperPlane />
            </Button>
            <Box display={"flex"} gap={1}>
              <Button rounded={"50%"} p={0} bg={"#e2e2daff"} w={5} flex="none" onClick={() => filesRef.current.click()}>
                <ImFolderPlus />
              </Button>
              <Input ref={filesRef} hidden type={'file'} multiple onChange={handleFileChange} />
              <Button rounded={"50%"} p={0} bg={"#e2e2daff"} w={5} flex="none">
                <Text fontSize={24} fontWeight={"bold"}>
                  @
                </Text>
              </Button>
            </Box>
          </Box>
          <VStack hidden={usersBoxStatus} w={'20%'} bg={'#e9e9e9ff'} position={'absolute'} top={'-55%'} rounded={10}>
            {users &&
              users.map(user => (
                <Text rounded={10} key={user._id} w={'full'} align={'center'} _hover={{ bg: '#ccccccff' }}
                  onClick={() => selectMention(user)}
                >{user.email}</Text>
              ))
            }
          </VStack>

        </Flex>
      </>
    </>
  );
};

export default SendMessage;

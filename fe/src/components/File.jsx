import React from 'react'
import { Flex, Box, Text, } from '@chakra-ui/react';
import { FaFile, FaDownload } from 'react-icons/fa';
import { ImEye } from 'react-icons/im';

const File = () => {
  return (
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
      <Box marginLeft={2} bg={'#ecececff'} _hover={{ cursor: 'pointer', bg: '#bebebeff' }} borderRadius={5} paddingInline={3} paddingBlock={1} textColor={'#501e50ff'} >
        <FaDownload />
      </Box>
    </Flex>
  )
}

export default File

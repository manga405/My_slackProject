import { Link, useNavigate } from "react-router-dom";
import { Input, Flex, VStack, HStack, Box, Image, Button, Text } from '@chakra-ui/react'
import { useState, useContext } from "react";
import Axios from "../libs/api";
import toast from "../utils/toast";

const Signin = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signin = async () => {
    try {
      if (!password || !email) return toast.error('Please fill all the fields')
      const result = await Axios({ url: '/auth/signin', method: 'POST', data: { email, password } })
      toast[result.data.status](result.data.mes)
      if (result.data.status == 'success') {
        localStorage.setItem('token', result.data.token)
        navigate('/home')
      }
    } catch (error) {
      toast.error('login error')
    }
  }
  return (
    <Box bg={'#491349ff'} w={'100vw'} h={'100vh'} justifyContent={'center'} display={'flex'} alignItems={'center'}>
      <VStack w={{ base: '35%', xl: '28%', lg: '30%', md: '40%', sm: '60%' }} bg={'#501e50'} p={'20px'} rounded={'8px'} gap={4}>
        <Text textColor={'#fff'} fontSize={'32px'}>Sign In</Text>
        <Input h={'36px'} bg={'#fff'} type="email" onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <Input h={'36px'} bg={'#fff'} type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <VStack w={'full'}>
          <HStack justifyContent={'space-around'} w={'full'} >
            <Text textColor={'#fff'}>Do you have account?</Text>
            <Link to='/signup' style={{ textDecoration: 'underline', color: '#7482ffff' }}>Go to Signup</Link>
          </HStack>
          <Button w={'28%'} roundedBottomRight={'24px'} roundedTopLeft={'24px'} onClick={signin} >Sign In</Button>
        </VStack>
      </VStack>
    </Box >
  )
}

export default Signin;
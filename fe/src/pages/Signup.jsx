import { Link, useNavigate } from "react-router-dom";
import { Input, Flex, VStack, HStack, Box, Image, Button, Text } from '@chakra-ui/react'
import { useState, useContext, useRef } from "react";
import api from "../libs/api";
import toast from "../utils/toast";


const Signup = () => {
  const navigate = useNavigate()

  const [signupData, setSignupData] = useState({})
  const [avatar, setAvatar] = useState({ file: {}, image: '' })
  const avatarRef = useRef()

  const getSignupData = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value })
  }

  const handleAvatar = (e) => {
    if(!e.target.files[0]) return
    console.log(e.target.files[0]);
    URL.createObjectURL(e.target.files[0])
    setAvatar({ file: e.target.files[0], image: URL.createObjectURL(e.target.files[0]) })

  }

  const signup = async () => {
    try {
      if (signupData.password != signupData.confirm) return toast.error('Confirm incorrect')
      const formData = new FormData();
      formData.append('avatar', avatar.file)
      formData.append('username', signupData.username)
      formData.append('email', signupData.email)
      formData.append('password', signupData.password)
      const result = await api({ url: '/auth/signup', method: 'POST', data: formData })
      toast[result.data.status](result.data.mes)
      if (result.data.status == 'success') {
        navigate('/')
      }
    } catch (error) {
      toast.error('signup error')
    }
  }

  return (
    <Box bg={'#491349ff'} w={'100vw'} h={'100vh'} justifyContent={'center'} display={'flex'} alignItems={'center'}>
      <VStack w={{ base: '35%', xl: '28%', lg: '30%', md: '40%', sm: '60%' }} bg={'#501e50'} paddingInline={'40px'} paddingBlock={'20px'} rounded={'8px'} gap={3} paddingTop={8}>
        <Image onClick={() => avatarRef.current.click()} w={'10vw'} h={'10vw'} alt="avatar" rounded={'20%'} src={avatar.image ? avatar.image : process.env.REACT_APP_BASE_URL + '/avatar/default.gif'} />
        <Input hidden={true} type="file" ref={avatarRef} onChange={handleAvatar} />
        <Input h={'36px'} bg={'#fff'} name='username' onChange={getSignupData} type="text" placeholder="Name" />
        <Input h={'36px'} bg={'#fff'} name='email' onChange={getSignupData} type="email" placeholder="Email" />
        <Input h={'36px'} bg={'#fff'} name='password' onChange={getSignupData} type="password" placeholder="Password" />
        <Input h={'36px'} bg={'#fff'} name='confirm' onChange={getSignupData} type="password" placeholder="Confirm" />
        <VStack w={'full'}>
          <HStack justifyContent={'space-around'} w={'full'} >
            <Text textColor={'#fff'}>Do you have account?</Text>
            <Link to='/' style={{ textDecoration: 'underline', color: '#7482ffff' }}>Go to Login</Link>
          </HStack>
          <Button w={'100px'} roundedBottomRight={'24px'} roundedTopLeft={'24px'} onClick={signup}>Sign Up</Button>
        </VStack>
      </VStack>
    </Box>
  )
}

export default Signup;
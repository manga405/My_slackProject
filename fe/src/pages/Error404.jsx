import { Button, VStack, Text, Box } from "@chakra-ui/react"
import { Link } from "react-router-dom"


const Error404 = () => {


  return (
    <Box w={'100vw'} h={'100vh'} justifyContent={'center'} display={'flex'} alignItems={'center'} >
      <Button fontSize={'36px'} padding={'10'}><Link to='/'>Go to SlackPage</Link></Button>
    </Box>
  )
}

export default Error404
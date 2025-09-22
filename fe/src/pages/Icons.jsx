import { HStack, Text, Wrap, Box, Divider } from "@chakra-ui/react";

import * as Fa from 'react-icons/fa';
import * as  BI from 'react-icons/bi';
import * as  BS from 'react-icons/bs';
import * as  WI from 'react-icons/wi';
import * as  IM from 'react-icons/im';


const Icons = () => {
    return (
        <Wrap>
            {
                Object.keys(Fa).map(item => {
                    return (
                        <HStack>
                            <Box>{Fa[item]()}</Box>
                            <Text>{item}</Text>
                        </HStack>
                    )
                })
            }
            <Divider border={10} borderColor={'#000'} />
            {
                Object.keys(BI).map(item => {
                    return (

                        <HStack>
                            <Box>{BI[item]()}</Box>
                            <Text>{item}</Text>
                        </HStack>
                    )
                })
            }
            <Divider border={10} borderColor={'#000'} />
            {
                Object.keys(BS).map(item => {
                    return (

                        <HStack>
                            <Box>{BS[item]()}</Box>
                            <Text>{item}</Text>
                        </HStack>
                    )
                })
            }
            <Divider border={10} borderColor={'#000'} />
            {
                Object.keys(WI).map(item => {
                    return (

                        <HStack>
                            <Box>{WI[item]()}</Box>
                            <Text>{item}</Text>
                        </HStack>
                    )
                })
            }
            <Divider border={10} borderColor={'#000'} />
            {
                Object.keys(IM).map(item => {
                    return (

                        <HStack>
                            <Box>{IM[item]()}</Box>
                            <Text>{item}</Text>
                        </HStack>
                    )
                })
            }
        </Wrap>
    )
}

export default Icons
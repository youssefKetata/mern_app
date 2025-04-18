import {
  Avatar,
  Center,
  Flex,
  Paper,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { NextPage } from 'next'
import axios from '../services/axios'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'
import SlackLogo from '../components/slack-logo'
import Button from '../components/button'
import WorkspacesSvg from '../components/pages/workspaces-svg'
import React from 'react'
import { BsArrowRightShort } from 'react-icons/bs'
import { getColorByIndex } from '../utils/helpers'
import { useAppContext } from '../providers/app-provider'
import { ApiError, Data } from '../utils/interfaces'

const Workspaces: NextPage = () => {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const { setData } = useAppContext()

  const mutation = useMutation({
    mutationFn: () => {
      return axios.post('/organisation')
    },
    onError(error: ApiError) {
      notifications.show({
        message: error?.response?.data?.data?.name,
        color: 'red',
        p: 'md',
      })
    },
    onSuccess(data) {
      router.push(`${data?.data?.data?._id}`)
    },
  })

  const query = useQuery(
    ['workspaces'],
    () => axios.get(`/organisation/workspaces`),
    {
      refetchOnMount: false,
      enabled: !!email,
    }
  )

  const organisations = query?.data?.data?.data

  function handleOpenWorkspace(organisation: Data) {
    setData(undefined)
    localStorage.setItem('organisationId', organisation?._id)
    router.push(`/c/${organisation?.channels?.[0]?._id}`)
    localStorage.setItem('channel', 'true')
  }

  React.useEffect(() => {
    if (router.query.token) {
      setEmail(router.query.email as string)
      localStorage.setItem('signUpEmail', router.query?.email as string)
      localStorage.setItem('access-token', router?.query?.token as string)
    }
  }, [router.query.token])
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('signUpEmail') as string)

      const signUpEmail = localStorage.getItem('signUpEmail')
      if (!signUpEmail) {
        // router.push('/signin')
      }
    }
  }, [])

  return (
    <Center p="xl" h="100vh" w="100vw">
      <Stack spacing="10rem">
        <Center>
          <SlackLogo />
        </Center>
        <Flex justify="center">
          <Stack spacing="xs" align="start" w="38%" justify="center">
            <Text fz="3xl" fw={600} c="white">
              Get started on ENET'SPACE
            </Text>
            <Text fz="sm" mt="xs" w="75%">
              it's a new way to communicate with everyone you work with. it's
              faster, better organized, and more secure than email - and it's
              free to try.
            </Text>
            <Stack>
              <Button
                loading={email ? mutation.isLoading : false} // Only show loading if email exists
                type="submit"
                mt="lg"
                px="2xl"
                onClick={() => {
                  if (email) {
                    mutation.mutate() // Create workspace if email exists
                  } else {
                    router.push('/register') // Go to register page if no email
                  }
                }}
              >
                {email
                  ? mutation.isLoading
                    ? ''
                    : 'Create Workspace'
                  : 'Register'}
              </Button>
            </Stack>
          </Stack>
          <Flex align="center" justify="center">
            <WorkspacesSvg />
          </Flex>
        </Flex>
        <Paper radius="lg" p="2xl" withBorder mt="xl" w="50%" mx="auto">
          {query.isLoading && (
            <Flex align="center" gap="sm">
              <Skeleton circle height={60} />
              <Stack spacing="xs">
                <Skeleton height={24} width={550} radius="lg" />
                <Skeleton height={24} width={250} radius="lg" />
              </Stack>
            </Flex>
          )}
          {organisations?.length >= 1 && (
            <Text fw="bold" c="white" mb="xl">
              Open a workspace
            </Text>
          )}
          {organisations?.length === 0 ? (
            <Center>
              <Flex direction="column" align="center" justify="center">
                <Text fz="lg" fw={600} c="white">
                  is your team already on ENET'SPACE?
                </Text>
                <Text fz="sm" mt="xs" w="75%" align="center">
                  We coudn't find any existing workspaces for the email address{' '}
                  {email}
                </Text>
                <Button
                  appearance="outline"
                  mt="lg"
                  px="2xl"
                  onClick={() => router.push('/signin')}
                >
                  Try a Different Email
                </Button>
              </Flex>
            </Center>
          ) : (
            <Stack>
              {organisations?.map((organisation: Data, index: number) => (
                <Flex
                  pb="md"
                  align="center"
                  key={organisation?._id}
                  style={{
                    borderBottom:
                      organisations.length - 1 === index
                        ? ''
                        : '1px solid #373A40',
                    justifyContent: 'space-between',
                  }}
                >
                  {organisation && (
                    <Flex align="center" gap="sm">
                      <Avatar
                        size="lg"
                        color={getColorByIndex(index)}
                        radius="xl"
                      >
                        {organisation.name[0].toUpperCase()}
                      </Avatar>
                      <Flex direction="column">
                        <Text c="white" transform="capitalize">
                          {organisation.name}
                        </Text>
                        <Text size="xs" transform="capitalize">
                          {organisation.coWorkers.length} members
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                  <Button
                    onClick={() => handleOpenWorkspace(organisation)}
                    rightIcon={<BsArrowRightShort />}
                    appearance="outline"
                  >
                    Open
                  </Button>
                </Flex>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Center>
  )
}

export default Workspaces

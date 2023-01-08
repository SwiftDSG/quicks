import { Chat, ChatMessage } from "~~/interfaces/general";

function genRandomStr(): string {
  const alphabet: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let str: string = "";

  for (let i: number = 0; i < 10; i++) {
    str += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return str;
}

export default function () {
  const chats = useState<Chat[]>('chats', () => null)
  const messages = useState<ChatMessage[]>('chat-messages', () => null)



  const loadChats = (query?: string): Chat[] => {
    const init: boolean = !!localStorage.getItem('initialized')
    if (!init) {
      const chats: Chat[] = [
        {
          _id: "0",
          title:
            "Jeannette Moraima Guaman Chamba (Hutto I-589) [ Hutto Follow Up - Brief Service ]",
          type: "group",
          member: [
            {
              _id: '0',
              name_color: '#9b51e0',
              background_color: '#eedcff'
            },
            {
              _id: '3',
              name_color: '#ed1f7f',
              background_color: '#f7d0e2'
            },
          ]
        },
        {
          _id: "1",
          title:
            "I-589 - AMARKHIL, Obaidullah [Affirmative Filing with ZHN]",
          type: "group",
          member: [
            {
              _id: '0',
              name_color: '#9b51e0',
              background_color: '#eedcff'
            },
            {
              _id: '1',
              name_color: '#e5a443',
              background_color: '#fceed3'
            },
            {
              _id: '2',
              name_color: '#43b78d',
              background_color: '#d2f2ea'
            },
            {
              _id: '3',
              name_color: '#ec1f7f',
              background_color: '#f7d0e2'
            },
          ]
        },
        {
          _id: "2",
          title:
            "FastVisa Support",
          type: 'individual',
        },
      ];
      const messages: ChatMessage[] = [
        {
          _id: '0',
          chat_id: '0',
          read: true,
          from: {
            _id: '0',
            name: 'Claren'
          },
          text: 'Hello!',
          date: new Date().toISOString()
        },
        {
          _id: '1',
          chat_id: '1',
          read: true,
          from: {
            _id: '1',
            name: 'Mary Hilda'
          },
          text: 'Just Fill me in for his updates yea?',
          date: '2023-01-01T12:32:00.000Z'
        },
        {
          _id: '2',
          chat_id: '1',
          read: true,
          from: {
            _id: '0',
            name: 'Claren'
          },
          text: 'No worries. It will be completed ASAP. I\'ve asked him yesterday.',
          date: '2023-01-01T12:34:00.000Z'
        },
        {
          _id: '3',
          chat_id: '1',
          read: true,
          from: {
            _id: '1',
            name: 'Mary Hilda'
          },
          text: 'Hello Obaidullah, I will be your case advisor for case #029290. I have assigned some homework for you to fill. Please keep up with the due dates. Should you have any questions, you can message me anytime. Thanks.',
          date: '2023-01-02T07:13:00.000Z'
        },
        {
          _id: '4',
          chat_id: '1',
          read: true,
          from: {
            _id: '0',
            name: 'Claren'
          },
          text: 'Please contact Mary for questions regarding the case bcs she will be managing your forms from now on! Thanks Mary.',
          date: '2023-01-02T07:14:00.000Z'
        },
        {
          _id: '5',
          chat_id: '1',
          read: true,
          from: {
            _id: '1',
            name: 'Mary Hilda'
          },
          text: 'Sure thing, Claren',
          date: '2023-01-02T07:15:00.000Z'
        },
        {
          _id: '6',
          chat_id: '1',
          read: false,
          from: {
            _id: '2',
            name: 'Obaidullah Amarkhil'
          },
          text: 'Morning. I\'ll try to do them. Thanks',
          date: '2023-01-02T07:16:00.000Z'
        },
        {
          _id: '6',
          chat_id: '2',
          read: false,
          from: {
            _id: '5',
            name: 'FastVisa Support'
          },
          text: 'Hey there! Welcome to your inbox.',
          date: new Date().toISOString()
        },
      ]

      localStorage.setItem('chats', JSON.stringify(chats))
      localStorage.setItem('chat-messages', JSON.stringify(messages))
      localStorage.setItem('initialized', 'true')
    }

    chats.value = JSON.parse(localStorage.getItem('chats')) as Chat[]
    messages.value = JSON.parse(localStorage.getItem('chat-messages')) as ChatMessage[]

    let payload: Chat[] = []

    for (const message of messages.value || []) {
      const index: number = chats.value?.findIndex((a) => a._id === message.chat_id)
      if (index > -1) {
        chats.value[index].message = message
      }
    }

    if (!query) payload = chats.value
    else {
      payload = chats.value?.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
    }

    return payload
  }

  const selectChat = (_id: string): Chat => {
    const chat: Chat = chats.value?.find((a) => a._id === _id)

    if (chat) return JSON.parse(JSON.stringify(chat))
    return null
  }
  const loadMessages = (_id: string): {
    unread?: boolean
    date: Date,
    messages: ChatMessage[]
  }[] => {
    const message: ChatMessage[] = messages.value?.filter((a) => a.chat_id === _id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const unreadMessage: ChatMessage[] = message.filter((a) => !a.read)
    const readMessage: ChatMessage[] = message.filter((a) => a.read)

    const payload: {
      unread?: boolean
      date: number
      messages: ChatMessage[]
    }[] = readMessage.reduce((a, b) => {
      const date: number = new Date(b.date).setHours(0, 0, 0, 0)
      if (a?.length) {
        const index: number = a.findIndex((a) => a.date === date)
        if (index > -1) {
          a[index].messages.push(b)
          return a
        }
        return a = [...a, {
          date,
          messages: [b]
        }]
      } else {
        a = [{
          date,
          messages: [b]
        }]
        return a
      }
    }, [])

    if (unreadMessage?.length) {
      payload.unshift({ unread: true, date: new Date(unreadMessage[0].date).setHours(0, 0, 0, 0), messages: unreadMessage })
    }

    return payload.map((a) => ({ date: new Date(a.date), messages: a.messages, unread: a.unread }))
  }
  const readMessages = (chat_id: string): void => {
    const index: number = chats.value?.findIndex((a) => a._id === chat_id)
    if (index > -1) {
      messages.value = messages.value.map((a) => {
        if (a.chat_id === chat_id) return { ...a, read: true }
        return a
      })
      localStorage.setItem('chat-messages', JSON.stringify(messages.value))
    }
  }
  const sendMessage = (message: ChatMessage): void => {
    messages.value.push(message)
    localStorage.setItem('chat-messages', JSON.stringify(messages.value))
  }
  const editMessage = (_id: string, text: string): void => {
    const index: number = messages.value?.findIndex((a) => a._id === _id)
    if (index > -1) {
      messages.value[index].text = text
      messages.value[index].edited = true
      localStorage.setItem('chat-messages', JSON.stringify(messages.value))
    }
  }
  const deleteMessage = (_id: string): void => {
    const index: number = messages.value?.findIndex((a) => a._id === _id)
    if (index > -1) {
      messages.value.splice(index, 1)
      localStorage.setItem('chat-messages', JSON.stringify(messages.value))
    }
  }
  const generateMessageId = (): string => {
    return genRandomStr()
  }


  return { chats, messages, loadChats, selectChat, loadMessages, readMessages, sendMessage, editMessage, deleteMessage, generateMessageId }
}
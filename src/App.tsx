import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { io, Socket } from 'socket.io-client'

type Commercial = {
  id: string
  name: string
  price: number
  description: string
  image: string
}

const Container = styled.main.attrs({
  className: 'container',
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
  width: 100%;
  margin: 0 auto;
`

const Title = styled.h1.attrs({
  className: 'title',
})`
  margin-bottom: 1rem;
`

const Price = styled.p.attrs({
  className: 'price',
})`
  font-weight: bold;
  margin: 0.5rem 0;
`

const Image = styled.img.attrs({
  className: 'image',
})`
  max-width: 100%;
  height: auto;
  border-radius: 4px;
`

const List = styled.ul.attrs({
  className: 'list',
})`
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 600px;
`

const Item = styled.li.attrs({
  className: 'item',
})`
  background: #f2f2f2;
  margin-bottom: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

function App() {
  const [commercial, setCommercial] = useState<Commercial | null>(null)
  
  const testURL = 'http://172.16.10.92:4000'

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? testURL // default to same origin
    const socket: Socket = io(backendUrl ?? undefined, {
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.info('Socket connected', socket.id)
    })

    socket.on('commercial', (data: Commercial) => {
      // setCommercials((prev) => [data, ...prev])
      setCommercial(data)
      console.log(data)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <Container>
      <Title>Commercials Feed</Title>
      {!commercial && <p>No commercials received yet.</p>}
      <List>
        {commercial && (
          <Item>
            <strong>{commercial.name}</strong>
            <Price>${commercial.price.toFixed(2)}</Price>
            <p>{commercial.description}</p>
            <Image src={commercial.image} alt={commercial.name} />
          </Item>
        )}
      </List>
    </Container>
  );
}

export default App

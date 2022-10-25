import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const Home: NextPage = () => {
  const [username, setUsername] = useState<string>("");
  const router = useRouter();
  // const [socketURL, setSocketURL] = useState<string>('ws://localhost:4000/');
  // const { sendMessage, lastMessage, readyState } = useWebSocket(socketURL, {
  //   reconnectAttempts: 1,
  // });

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: 'Connecting',
  //   [ReadyState.OPEN]: 'Open',
  //   [ReadyState.CLOSING]: 'Closing',
  //   [ReadyState.CLOSED]: 'Closed',
  //   [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  // }[readyState];

  // const handleSendMessage = useCallback(() => {
  //   sendMessage('hello');
  // }, [sendMessage])

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    router.push(`connect?username=${username}`);
  }

  return (
    <main>
      <form onSubmit={handleFormSubmit}>
        <h1>Tic Tac Toe</h1>
        <div style={{
          'display': 'flex',
          'flexDirection': 'column',
        }}>
          <label htmlFor="">Username</label>
          <input
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <button 
            style={{'margin': '1em 0'}}
            onSubmit={handleFormSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </main>
  )
}

export default Home

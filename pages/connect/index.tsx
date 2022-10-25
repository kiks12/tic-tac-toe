import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from "next"
import { useEffect, useState } from "react"
import useWebSocket from "react-use-websocket";

const Connect: NextPage = ({ 
  username
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const [socketURL, setSocketURL] = useState<string>('ws://localhost:4000');
  const [playerNumber, setPlayerNumber] = useState<number>(0);
  const [players, setPlayers] = useState<any[]>([
    {
      id: 1,
      name: 'Francis'
    },
    {
      id: 2,
      name: 'James',
    },
  ]);
  const [side, setSide] = useState<number>(0);
  const [turn, setTurn] = useState<boolean>(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const { sendJsonMessage, lastJsonMessage, lastMessage, readyState } = useWebSocket(socketURL);
  const [grid, setGrid] = useState<number[][]>([]);

  useEffect(() => {
    sendJsonMessage({
      username,
      connect: true,
    });
  }, [sendJsonMessage, username]);

  useEffect(() => {
    setMessageHistory(prev => [...prev, lastJsonMessage]);
  }, [lastJsonMessage]);

  useEffect(() => {
    setMessageHistory(prev => [...prev, lastMessage]);
  }, [lastMessage]);

  useEffect(() => {
    createGrid()
  }, []);

  const createGrid = () => {
    const newGrid: number[][] = [];
    for (let i in [0, 1, 2]) {
      let row: number[] = []
      for (let i in [0, 1, 2]) {
        row.push(0); 
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  }

  return (
    <main style={{
      'flexDirection': 'column'
    }}>
      <div style={{
        'width': 'min(90%, 30em)',
        'display': 'flex',
        'justifyContent': 'space-between',
        'alignItems': 'center'
      }}>
        <h1>Tic Tac Toe</h1>
        <button>Quit</button>
      </div>
      <div style={{
        'width': 'min(90%, 30em)',
      }}>
        {
          players.length !== 0 &&
          players.map((player, idx) => {
            return (
              <div key={idx} style={{'margin': '-1em 0.2em'}}>
                <div style={{
                  'display': 'flex',
                  'alignItems': 'center',
                }}>
                  <p>Player {player.id}: {player.name}</p>
                  <p style={{'margin': '0 0.5em'}}>
                    {player.id === 1 ? '🟢' : '❌'}
                  </p>
                </div>
              </div>
            )
          })
        }
      </div>
      <div style={{
        'width': 'min(90%, 30em)',
        'flex': '1',
        'margin': '1em 0',
      }}>
        {
          grid.length !== 0 &&
          grid.map((row, idx) => {
            return (
              <div style={{'display': 'flex', 'height': '33%'}} key={idx}>
                {
                  row.map((_col, jdx) => {
                    return (
                      <div 
                        key={jdx}
                        style={{
                          'padding': '1em',
                          'border': '0.5px solid lightgray',
                          'borderRadius': '0.5em',
                          'margin': '0.25em',
                          'width': '33%',
                        }}
                      >
                        {/* {col} */}
                      </div>
                    )
                  }) 
                }
              </div>
              )
          })
        }
      </div>
      {/* <div style={{
        'background': 'rgba(90,90,90,0.1)',
        'borderRadius': '0.5em',
        'padding': '0.5em 1em',
        'width': 'min(90%, 30em)',
        'margin': '0 auto',
        'height': '15vh',
        'maxHeight': '15vh',
        'overflow': 'scroll'
      }}>
        <pre>
          {JSON.stringify(messageHistory, null, 2)}
        </pre>
      </div> */}
    </main>
  )
}

export const getServerSideProps:GetServerSideProps = async ({
  query
}: GetServerSidePropsContext) => {

  if (!('username' in query) || query.username === '') {
    return {
      redirect: {
        'destination': '/waiting/',
        'permanent': false,
      },
      props: {}
    }
  }

  return {
    props: {
      username: query.username ?? '',
    }
  };
}

export default Connect;
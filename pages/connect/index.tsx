import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router";
import { useEffect, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket";

const Connect: NextPage = ({ 
  username
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const router = useRouter();
  const [socketURL] = useState<string>('ws://localhost:4000');
  const [playerID, setPlayerID] = useState<number>(0);
  const [players, setPlayers] = useState<any[]>([]);
  const [turn, setTurn] = useState<number>(0);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const { sendJsonMessage, lastJsonMessage, lastMessage, readyState } = useWebSocket(socketURL);
  const [grid, setGrid] = useState<number[][]>([]);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      router.push('/waiting');
    }
  }, [router, readyState]);

  useEffect(() => {
    sendJsonMessage({
      username,
      connect: true,
    });
  }, [sendJsonMessage, username]);

  useEffect(() => {
    setMessageHistory(prev => [...prev, lastJsonMessage]);
    if (lastJsonMessage && 'players' in lastJsonMessage) {
      lastJsonMessage.players.forEach((player: any) => {
        if (player.name === username) {
          setPlayerID(player.id);
        }
      })
      setPlayers(lastJsonMessage.players);
    }
    if (lastJsonMessage && 'grid' in lastJsonMessage) setGrid(lastJsonMessage.grid);
    if (lastJsonMessage && 'turn' in lastJsonMessage) setTurn(lastJsonMessage.turn);
  }, [lastJsonMessage, username, playerID]);

  useEffect(() => {
    setMessageHistory(prev => [...prev, lastMessage]);
  }, [lastMessage]);

  // useEffect(() => {
    // createGrid()
  // }, []);

  // const createGrid = () => {
  //   const newGrid: number[][] = [];
  //   for (let i in [0, 1, 2]) {
  //     let row: number[] = []
  //     for (let i in [0, 1, 2]) {
  //       row.push(0); 
  //     }
  //     newGrid.push(row);
  //   }
  //   setGrid(newGrid);
  // }

  const handleTileClick = (r: number, c: number) => {
    if (turn !== playerID) return;
    setGrid((prev) => {
      return prev.map((row, idx) => {
        return row.map((col, jdx) => {
          if (r === idx && c === jdx) return playerID;
          return col;
        })
      })
    });
    sendJsonMessage({
      grid,
    });
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
                  'color': turn === player.id ? 'green' : 'black',
                }}>
                  <p>Player {player.id}: {player.name}</p>
                  <p style={{
                    'margin': '0 0.5em',
                  }}>
                    {player.id === 1 ? '🟢' : '❌'}
                    {playerID === player.id ? ' (You)' : ''} 
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
              <div 
                style={{'display': 'flex', 'height': '33%'}} 
                key={idx}
              >
                {
                  row.map((col, jdx) => {
                    return (
                      <div 
                        onClick={() => handleTileClick(idx, jdx)}
                        key={jdx}
                        style={{
                          'padding': '0.5em',
                          'border': '0.5px solid lightgray',
                          'borderRadius': '0.5em',
                          'margin': '0.25em',
                          'width': '33%',
                          'display': 'flex',
                          'alignItems': 'center',
                          'justifyContent': 'center',
                          'fontSize': '1.5em',
                        }}
                      >
                        <h1>
                          { playerID === col && playerID === 1 ? '🟢' : ''} 
                          { playerID === col && playerID === 2 ? '❌' : ''} 
                        </h1>
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
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const Connect: NextPage = ({ username }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [socketURL] = useState<string>("ws://localhost:4000");
  const [playerID, setPlayerID] = useState<number>(0);
  const [players, setPlayers] = useState<any[]>([]);
  const [turn, setTurn] = useState<number>(0);
  const [moved, setMoved] = useState<boolean>(false);
  const { sendJsonMessage, lastJsonMessage, lastMessage, readyState } = useWebSocket(socketURL);
  const [grid, setGrid] = useState<number[][]>([]);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      router.push("/waiting");
    }
  }, [router, readyState]);

  useEffect(() => {
    sendJsonMessage({
      username,
      connect: true,
    });
  }, [sendJsonMessage, username]);

  useEffect(() => {
    if (lastJsonMessage && "players" in lastJsonMessage) {
      lastJsonMessage.players.forEach((player: any) => {
        if (player.name === username) {
          setPlayerID(player.id);
        }
      });
      setPlayers(lastJsonMessage.players);
    }
  }, [lastJsonMessage, username, playerID]);

  useEffect(() => {
    if (lastJsonMessage && "grid" in lastJsonMessage && turn === playerID) setGrid(lastJsonMessage.grid);
  }, [lastJsonMessage, playerID, turn]);

  useEffect(() => {
    if (lastJsonMessage && "turn" in lastJsonMessage) setTurn(lastJsonMessage.turn);
  }, [lastJsonMessage]);

  useEffect(() => {
    if (moved) setTurn(turn === 1 ? 2 : 1);
  }, [moved, turn]);

  useEffect(() => {
    if (turn !== playerID && moved) {
      setMoved(false);
      sendJsonMessage({
        move: true,
        grid,
      });
    }
  }, [grid, playerID, sendJsonMessage, turn, moved]);

  useEffect(() => {
    if (lastJsonMessage && "winner" in lastJsonMessage) {
      if (lastJsonMessage.winner !== 0) {
        const winner = players.filter((player) => player.id === lastJsonMessage.winner)[0];
        alert(`The winner is Player ${lastJsonMessage.winner}: ${winner?.name}`);
        restartGrid();
      }
    }
  }, [lastJsonMessage]);

  const restartGrid = async () => {
    setGrid([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    setMoved(true);
  };

  const mutateGrid = async (r: number, c: number) => {
    setGrid((prev) => {
      return prev.map((row, idx) => {
        return row.map((col, jdx) => {
          if (r === idx && c === jdx && col === 0) {
            setMoved(true);
            return playerID;
          }
          return col;
        });
      });
    });
  };

  const handleTileClick = async (r: number, c: number) => {
    if (turn !== playerID) return;
    mutateGrid(r, c);
  };

  const quit = async () => {
    sendJsonMessage({
      close: true,
      username,
    });
  };

  return (
    <main
      style={{
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "min(90%, 30em)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Tic Tac Toe</h1>
        <button onClick={quit}>Quit</button>
      </div>
      <div
        style={{
          width: "min(90%, 30em)",
        }}
      >
        {players.length !== 0 &&
          players.map((player, idx) => {
            return (
              <div key={idx} style={{ margin: "-1em 0.2em" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: turn === player.id ? "green" : "black",
                  }}
                >
                  <p>
                    Player {player.id}: {player.name}
                  </p>
                  <p
                    style={{
                      margin: "0 0.5em",
                    }}
                  >
                    {player.id === 1 ? "🟢" : "❌"}
                    {playerID === player.id ? " (You)" : ""}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
      <div
        style={{
          width: "min(90%, 30em)",
          flex: "1",
          margin: "1em 0",
        }}
      >
        {grid.length !== 0 &&
          grid.map((row, idx) => {
            return (
              <div style={{ display: "flex", height: "33%" }} key={idx}>
                {row.map((col, jdx) => {
                  return (
                    <div
                      onClick={() => handleTileClick(idx, jdx)}
                      key={jdx}
                      style={{
                        padding: "0.5em",
                        border: "0.5px solid lightgray",
                        borderRadius: "0.5em",
                        margin: "0.25em",
                        width: "33%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5em",
                      }}
                    >
                      <h1>
                        {col === 1 && "🟢"}
                        {col === 2 && "❌"}
                        {col === 0 && ""}
                      </h1>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }: GetServerSidePropsContext) => {
  if (!("username" in query) || query.username === "") {
    return {
      redirect: {
        destination: "/waiting/",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {
      username: query.username ?? "",
    },
  };
};

export default Connect;

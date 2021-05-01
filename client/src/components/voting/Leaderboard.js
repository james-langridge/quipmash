import React, { useContext } from "react";
import SocketContext from '../../socketContext/context';
import Table from 'react-bootstrap/Table';

const Leaderboard = () => {
  const { roomInfo: {players} } = useContext(SocketContext);
  const scores = players.map(({playerID, hasSubmittedAnswers, hasVoted, isConnected, ...scores}) => scores);
  scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

  return (
    <Table
      striped
      bordered
      variant="dark"
    >
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((user, i) =>
          <tr key={user.username}>
            <td>{i+1}</td>
            <td>{user.username}</td>
            <td>{user.score}</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default Leaderboard;

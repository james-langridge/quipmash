import React, { useContext } from "react";
import SocketContext from '../socketContext/context';
import Table from 'react-bootstrap/Table';

const Leaderboard = () => {
  const { scores } = useContext(SocketContext);

  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((user, i) =>
          <tr>
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

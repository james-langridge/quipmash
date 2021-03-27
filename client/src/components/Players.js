import React from "react";
import Player from "./Player";

const Players = (props) => {
  return (
    <>
      {props.players.map(player =>
        <Player
          key={player.userID}
          player={player}
        />
      )}
    </>
  );
}

export default Players;

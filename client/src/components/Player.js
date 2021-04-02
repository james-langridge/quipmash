import React from "react";

const Player = (props) => {
  return (
    <div className="player">
          { props.player.username } { props.player.self ? " (yourself) " : "" }
    </div>
  );
}

export default Player;

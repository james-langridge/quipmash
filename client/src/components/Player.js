import React from "react";
import StatusIcon from "./StatusIcon";

const Player = (props) => {
  return (
    <div className="player">
          { props.player.username } { props.player.self ? " (yourself) " : "" }
          <StatusIcon connected={props.player.connected} />{ props.player.connected ? "online" : "offline" }
    </div>
  );
}

export default Player;

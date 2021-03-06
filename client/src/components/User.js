import React from "react";
import StatusIcon from "./StatusIcon";

const User = (props) => {
  return (
    <div className="user">
          { props.user.username } { props.user.self ? " (yourself) " : "" }
          <StatusIcon connected={props.user.connected} />{ props.user.connected ? "online" : "offline" }
    </div>
  );
}

export default User;

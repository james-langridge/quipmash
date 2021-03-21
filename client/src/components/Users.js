import React from "react";
import StatusIcon from "./StatusIcon";
import User from "./User";

const Users = (props) => {
  return (
    <>
      {props.users.map(user =>
        <User
          key={user.userID}
          user={user}
        />
      )}
    </>
  );
}

export default Users;

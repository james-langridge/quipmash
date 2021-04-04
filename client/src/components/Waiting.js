import React from "react";
import Image from 'react-bootstrap/Image';
import Alert from 'react-bootstrap/Alert';

const Waiting = () => {
  return (
    <>
      <Alert variant="success">Waiting for other players...</Alert>
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif"
        fluid
        className="my-2"
      />
    </>
  );
}

export default Waiting;

import React, { useState, useEffect, useRef } from "react";
import Badge from 'react-bootstrap/Badge';

const Countdown = (props) => {
  const [isTimeUp, setIsTimeUp] = props.functions;
  const [timer, setTimer] = useState(props.time);
  const id = useRef(null);

  const clear = () => {
    window.clearInterval(id.current);
  };

  useEffect(() => {
    id.current = window.setInterval(() => {
      setTimer((time) => time-1);
    }, 1000);

    return () => clear();
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setIsTimeUp(true);
      clear();
    };
  }, [timer]);

  return (
    <h5 className="my-2">
      <Badge
        pill
        variant="danger"
      >
        {timer}
      </Badge>
      seconds left!
    </h5>
  );
}

export default Countdown;

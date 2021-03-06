import React from "react";
import styled from 'styled-components';

const Icon = styled.i`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
`;

const StatusIcon = (props) => {
  return (
    <Icon style={{ backgroundColor: (props.connected ? '#86bb71' : '#e38968') }}></Icon>
  );
}

export default StatusIcon;

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import SocketProvider from './socketContext';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <SocketProvider>
        <Router>
          <App />
        </Router>
    </SocketProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

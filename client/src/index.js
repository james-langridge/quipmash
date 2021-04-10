import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import SocketProvider from './socketContext';
import store from "./store";
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <SocketProvider>
          <Router>
            <App />
          </Router>
      </SocketProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

import React from "react";
import { Route, Switch } from "react-router-dom";
import Header from './components/Header';
import SelectUsername from './components/SelectUsername';
import Game from './components/Game';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = (props) => {

  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/" component={SelectUsername} />
        <Route exact path="/game" component={Game} />
      </Switch>
      <Footer />
    </div>
  );
}

export default App;

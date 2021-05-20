import './App.css';
import React from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {CreateAccessory} from "./routes/CreateAccessory";
import {GenerateKat} from "./routes/GenerateKat"

function App() {
  return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/create/accessory">Create Accessory</Link>
              </li>
              <li>
                <Link to="/generate/kat">Create Kat</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/generate/kat">
              <GenerateKat />
            </Route>
            <Route path="/create/accessory">
              <CreateAccessory />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
  );
}
function Home() {
  return <h2>Home</h2>;
}

export default App;

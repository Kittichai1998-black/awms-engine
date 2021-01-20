import React, { useReducer, useContext, useEffect, Suspense } from 'react';
import Layout from '../layouts';
import P404 from './page/Pages/404';
import Login from './page/Pages/Login/Login';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import DefaultLayout from '../layouts/defaultLayout';
import AmSpinner from "../components/AmSpinner";
import MonitorIO from "./page/Monitor/MonitorIO"

const App = (props) => {

  const container = (comp) => {
    return <Suspense fallback={null}><div style={{ padding: "20px 20px" }}>{comp}</div></Suspense>
  }

  return (
    <div>
      <AmSpinner textshow="Loading Data..." />
      <BrowserRouter>
        <Switch>
          <Route path="/Login" name="Login Page" render={() => <Login alternateLogin={false} loginCount={1}/>} />
          <Route path="/monitor_io" name="Monitor IO" render={() => container(<MonitorIO />)} />
          <Route path="/404" name="Not Found" component={P404} />
          <Route path="/" name="Home" component={Layout} />
          {/* <Route path="/" name="Main" component={Login}/>        */}
        </Switch>
      </BrowserRouter>
    </div>
  )

}

export default App

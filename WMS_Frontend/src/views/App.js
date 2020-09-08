import React, { useReducer, useContext, useEffect, Suspense } from 'react';
import Layout from '../layouts';
import P404 from './page/Pages/404';
import Login from './page/Pages/Login/Login';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import DefaultLayout from '../layouts/defaultLayout';
import AmSpinner from "../components/AmSpinner";
import MonitorIO from "./page/Monitor/MonitorIO"
import MonitorWorkingIn from "./page/STGT/Monitor/MonitorWorkingIn"
import MonitorWorkingOut from "./page/STGT/Monitor/MonitorWorkingOut"
import MonitorWorking from "./page/STGT/Monitor/MonitorWorking"

const App = (props) => {

  // var console = (function (oldCons) {
  //   return {
  //     log: function (text) {
  //       //oldCons.log(text);
  //       // Your code
  //     },
  //     info: function (text) {
  //       oldCons.info(text);
  //       // Your code
  //     },
  //     warn: function (text) {
  //       oldCons.warn(text);
  //       // Your code
  //     },
  //     error: function (text) {
  //       oldCons.error(text);
  //       // Your code
  //     }
  //   };
  // }(window.console));
  window.console = console;

  const container = (comp) => {
    return <Suspense fallback={null}><div style={{ padding: "20px 20px" }}>{comp}</div></Suspense>
  }

  return (
    <div>
      <AmSpinner textshow="Loading Data..." />
      <BrowserRouter>
        <Switch>
          <Route path="/Login" name="Login Page" render={() => <Login />} />
          <Route path="/monitor_io" name="Monitor IO" render={() => container(<MonitorIO />)} />
          <Route path="/monitor_wk_in" name="Monitor Working In" render={() => container(<MonitorWorkingIn />,)} />
          <Route path="/monitor_wk_out" name="Monitor Working Out" render={() => container(<MonitorWorkingOut />)} />
          <Route path="/monitor_wk" name="Monitor Working" render={() => container(<MonitorWorking />)} />
          <Route path="/404" name="Not Found" component={P404} />
          <Route path="/" name="Home" component={Layout} />
          {/* <Route path="/" name="Main" component={Login}/>        */}
        </Switch>
      </BrowserRouter>
    </div>
  )

}

export default App

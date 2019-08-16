import React, { useReducer, useContext, useEffect } from 'react';
import Layout from '../layouts';
import P404 from './page/Pages/404';
import Login from './page/Pages/Login/Login';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import DefaultLayout from '../layouts/defaultLayout';
import AmSpinner from "../components/AmSpinner";

const App = (props) => {

  return (
      <div>
        <AmSpinner textshow="Loading Data..." />
        <BrowserRouter>
          <Switch>
            <Route exact path="/Login" name="Login Page" render={()=> <Login />} />
            <Route  path="/404" name="Not Found" component={P404} />
            <Route path="/" name="Home" component={Layout} />
            {/* <Route path="/" name="Main" component={Login}/>        */}
          </Switch>
        </BrowserRouter>
      </div>
  )

}

export default App

import React, {Component} from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Axios from 'axios';

async function logout(){
    let tokendata = sessionStorage.getItem("tokendata");
    let data = {"token":tokendata.token, "secretKey":tokendata.secretKey};
    let config = {
        headers: { 'Access-Control-Allow-Origin':'*','Content-Type': 'application/json; charset=utf-8' ,'accept': 'application/json'}
      };
    await Axios.post('https://localhost:44366/api/token/remove',data,config)
    .then((res) => {
        return res.data;
    }).catch((error) => {
        console.log(error)
    });
}

let Logout = logout();

async function checkToken(){
    let currentLocation = this.props.location.pathname;
    let getmenu = sessionStorage.getItem("MenuItems");
    for(let k in getmenu){
        for(let j in k.children){
            if(currentLocation !== j.url){
                return <Redirect to="/404"/>
            }
        }
    }
}

let CheckToken = checkToken();

export {Logout,CheckToken};

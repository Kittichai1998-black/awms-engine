import React, { Component, useContext } from 'react';
import Axios from 'axios';
import {Redirect} from 'react-router-dom'
import { CallbackContext } from '../reducers/context';

const [callback, setCallback] = useContext(CallbackContext);

function APIGet(url) {
    setCallback(callback + 1);
    return Axios.get(url + "&_token=" + localStorage.getItem("Token")).then((res) => {
        
        setCallback(callback - 1);
        if (res.data._result.status === 0) {
            if(res.data._result.code === "A0001"){
                alert(res.data._result.message)
                sessionStorage.clear();
                localStorage.clear();
                return <Redirect to="/Login"/>
            }
            else
                alert(res.data._result.message)
        }
        return res
        
    });
};

function APIPost(url, dataR) {
    setCallback(callback + 1);
    let data = trimObj(dataR)
    if (data !== undefined) {
        data._token = localStorage.getItem("Token")
    }
    return Axios.post(url, data).then((res) => {
        setCallback(callback - 1);
        if (res.data._result.status === 0) {
            if(res.data._result.code === "A0001"){
                alert(res.data._result.message)
                sessionStorage.clear();
                localStorage.clear();
                return <Redirect to="/Login"/>
            }
            else
                alert(res.data._result.message)
        }
        return res
    });
};

function APIPut(url, dataR) {
    setCallback(callback + 1);
    let data = trimObj(dataR)
    data._token = localStorage.getItem("Token")
    return Axios.put(url, data).then((res) => {
        setCallback(callback - 1);
        if (res.data._result.status === 0) {
            if(res.data._result.code === "A0001"){
                alert(res.data._result.message)
                sessionStorage.clear();
                localStorage.clear();
                return <Redirect to="/Login"/>
            }
            else
                alert(res.data._result.message)
        }
        return res
    });
};

function APIDelete(url, dataR) {
    setCallback(callback + 1);
    let data = trimObj(dataR)
    data._token = localStorage.getItem("Token")
    return Axios.delete(url, data).then((res) => {
        setCallback(callback - 1);
        if (res.data._result.status === 0) {
            if(res.data._result.code === "A0001"){
                alert(res.data._result.message)
                sessionStorage.clear();
                localStorage.clear();
                return <Redirect to="/Login"/>
            }
            else
                alert(res.data._result.message)
        }
        return res
    });
};

function APIAll(utlArray) {
    setCallback(callback + 1);
    return Axios.all(utlArray).then(res => {
        setCallback(callback - 1);
        return res
    })
};

export { APIGet, APIPost, APIPut, APIDelete, APIAll  }
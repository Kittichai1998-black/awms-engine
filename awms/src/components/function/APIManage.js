import React, {useState, useContext, useEffect} from 'react';
import Axios from 'axios';
import {Redirect} from 'react-router-dom'
import { CallbackContext } from "../../reducers/context";

async function useAPIGet(url){
    let callback = useContext(CallbackContext);

    if(url){
        const response = await Axios.get(url + "&_apikey=free03").then((res) => {
        
            callback = callback + 1;
            console.log(callback)
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
            
            callback = callback - 1;
            console.log(callback === 0 ? "load complete" : "wait")
            //setResult(res);
            return res;
        });
    
        return response;
    }
    else
        return null;
}

export { useAPIGet }
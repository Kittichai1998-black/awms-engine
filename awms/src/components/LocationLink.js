// import React, { Component } from 'react';
import moment from 'moment';
import TextField from '@material-ui/core/TextField';
import React, { useState, useEffect,useContext } from "react";
import { LocationContext } from '../reducers/context';

 const   LocationLink = (props) => {
    const [location, setLocation] = useState(props.location);
    const [locat, dispatchLocat] = useContext(LocationContext);

    useEffect(()=>
    {dispatchLocat({type:"open",location})}
    ,[])


        return (
             <div></div>
        );
 }
            
export default LocationLink;

import React, { Component } from 'react';
import {DocumentEventStatus} from '../Warehouse/Status'

const StatusField = (statustype, status, displaytype) => {
    const res = DocumentEventStatus.filter(row => {
        return row.code === status
    })
    if(displaytype === "img"){
        return res.map(row => <img src={row.pathImg} width={row.width}/>)
    }
    else if(displaytype === "text"){
        return res.map(row => row.status)
    }
    else{
        return res.map(row => <span><img src={row.pathImg} width={row.width}/>{row.status}</span>)
    }
}

export default StatusField
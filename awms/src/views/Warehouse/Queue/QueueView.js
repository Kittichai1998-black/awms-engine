import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import ReactTable from 'react-table';
import { apicall } from '../ComponentCore';

const API = new apicall()

class QueueView extends Component{
  constructor(){
    super();
    select={queryString:window.apipath + "/api/viw",
                t:"User",
                q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
                f:"ID,Code,Name,Password,SoftPassword,EmailAddress,LineID,FacebookID,TelOffice,TelMobile,Status,Created,Modified",
                g:"",
                s:"[{'f':'Code','od':'asc'}]",
                sk:0,
                l:100,
                all:"",
            }
  }
  
  render(){
    return(
      <div>
        <ReactTable />
      </div>
    )
  }
}

export default QueueView;

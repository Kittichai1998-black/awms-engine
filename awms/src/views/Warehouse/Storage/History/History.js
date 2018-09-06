import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../../MasterData/TableSetup';
import ExtendTable from '../../MasterData/ExtendTable';
import queryString from 'query-string'
import Axios from 'axios';

class History extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      acceptstatus : false,
      statuslist:[{
        'status' : [{'value':'0','label':'Inactive'},{'value':'1','label':'Active'},{'value':'*','label':'All'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      }],
      select:{queryString:"https://localhost:44366/api/log",
      t:"StorageObjectEvent",
      q:[{ 'f': 'Sou_StorageObject_ID', c:'!=', 'v': ""}],
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'desc'}]",
      sk:"",
      l:20,
      all:"",},
      pivot:[],
      sortstatus:0,
      loaddata:false,
      updateflag:false,
    };
  }

  render(){
    const cols = [{accessor: 'ID', Header: 'Log ID', id: "ID", Filter:"text"},
    {accessor: 'ID', Header: 'Work', Filter:"text"},
    {accessor: 'ID', Header: 'Sort', Filter:"text"},
    {accessor: 'ID', Header: 'Command', Filter:"text"},
    {accessor: 'ID', Header: 'Destination', Filter:"text"},
    {accessor: 'ID', Header: 'Result', Filter:"text"},
    {accessor: 'ID', Header: 'Action By', Filter:"text"},
    {accessor: 'ID', Header: 'Start', Filter:"text"},
    {accessor: 'ID', Header: 'End', Filter:"text"},
    {accessor: 'ID', Header: 'Document', Filter:"text"},];

    const subcols = [
      {accessor: 'ID', Header: 'Log ID', id: "ID", Filter:"text"}, 
    ];

    const ddlfilter = [
    {
      'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
      'header' : 'Status',
      'field' : 'Status',
    }];

    const objselect = this.state.select
    const values = queryString.parse(this.props.location.search)
    objselect.q[0].v = values.StorageObject_ID
    console.log(objselect)

    //const url = "https://localhost:44366/api/trx/sto/search/?stoID&objectType&holdStatus&eventStatus&status&productDate&expireDate&batch&lot&rootBaseCode&rootBaseTypeCode&rootBaseTypeName&sKUCode&sKUName&packCode&packName&branchCode&branchName&warehouseCode&warehouseName&areaCode&areaName&customerCode&customerName&s_f=ID&s_od=ASC&sk=0&l=222"
    return(
      <div>
        <ExtendTable data={objselect} column={cols} subcolumn={subcols} dropdownfilter={ddlfilter} pivotBy={this.state.pivot} subtablewidth={700}
        url={null} filterable={false} subtype={2}/>
      </div>
    )
  }
}

export default History;

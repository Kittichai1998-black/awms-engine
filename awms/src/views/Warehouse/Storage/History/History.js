import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../../MasterData/TableSetup';
import ExtendTable from '../../MasterData/ExtendTable';
import queryString from 'query-string'
import Axios from 'axios';
import {apicall} from '../../ComponentCore'

const api = new apicall()

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
      select:{queryString:window.apipath + "/api/trx/sto/search",
      t:"",
      q:"",
      fields:"stoID,objectType,holdStatus,eventStatus,status,productDate,expireDate,batch,lot,rootBaseCode,rootBaseTypeCode,rootBaseTypeName,sKUCode,sKUName,packCode,packName,branchCode,branchName,warehouseCode,warehouseName,areaCode,areaName,customerCode,customerName",
      s_f:"{}",
      s_od:"{ASC}",
      sk:"",
      l:20,},
      pivot:[],
      sortstatus:0,
      loaddata:false,
      updateflag:false,
    };
  }

  render(){
    const cols = [{accessor: 'code', Header: 'ฺBase Code', id: "ID", Filter:"text"},
    {accessor: 'baseMaster_Code', Header: 'Base Type Code', Filter:"text"},
    {accessor: 'baseMaster_Name', Header: 'Base Type Name', Filter:"text"},
    {accessor: 'viewChildPackMaster_Codes', Header: 'Pack Code', Filter:"text"},
    {accessor: 'viewChildPackMaster_Names', Header: 'Pack Name', Filter:"text"},
    {accessor: 'viewChildPackMaster_Qty', Header: 'Pack Qty', Filter:"text"},
    {accessor: 'viewChildSKUMaster_Codes', Header: 'SKU Code', Filter:"text"},
    {accessor: 'viewChildSKUMaster_Names', Header: 'SKU Name', Filter:"text"},
    {accessor: 'viewChildSKUMaster_Qty', Header: 'SKU Qty', Filter:"text"},
    {accessor: 'branch_Code', Header: 'Branch Code', Filter:"text"},
    {accessor: 'branch_Name', Header: 'Branch Name', Filter:"text"},
    {accessor: 'warehouse_Code', Header: 'Warehouse Code', Filter:"text"},
    {accessor: 'warehouse_Name', Header: 'Warehouse Name', Filter:"text"},
    {accessor: 'areaMaster_Code', Header: 'Area Code', Filter:"text"},
    {accessor: 'areaMaster_Name', Header: 'Area Name', Filter:"text"},
    {accessor: 'areaLocationMaster_Bank', Header: 'Location', Filter:"text"},
    {accessor: 'holeStatus', Header: 'Hole', Filter:"text"},
    {accessor: 'status', Header: 'Status', Filter:"text"},
    {accessor: 'productDate', Header: 'Product Date', Filter:"text"},
    {accessor: 'expiryDate', Header: 'Expire Date', Filter:"text"},
    {accessor: 'createBy', Header: 'Create', Filter:"text"},
    {accessor: 'modifyBy', Header: 'Modify', Filter:"text"},];

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
    //objselect.q[0].v = values.StorageObject_ID
    console.log(objselect)

    //const url = "https://localhost:44366/api/trx/sto/search/?stoID&objectType&holdStatus&eventStatus&status&productDate&expireDate&batch&lot&rootBaseCode&rootBaseTypeCode&rootBaseTypeName&sKUCode&sKUName&packCode&packName&branchCode&branchName&warehouseCode&warehouseName&areaCode&areaName&customerCode&customerName&s_f=ID&s_od=ASC&sk=0&l=222"
    return(
      <div>
        <ExtendTable data={objselect} column={cols} subcolumn={subcols} dropdownfilter={ddlfilter} pivotBy={this.state.pivot} subtablewidth={700}
        url={null} filterable={false} subtype={1}/>
      </div>
    )
  }
}

export default History;

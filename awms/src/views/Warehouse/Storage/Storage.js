import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
import ExtendTable from '../MasterData/ExtendTable';
import Axios from 'axios';

class Pallet extends Component{
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
      select:{queryString:"https://localhost:44366/api/mst",
      t:"Supplier",
      q:[{ 'f': 'Status', c:'!=', 'v': 2}],
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:20,
      all:"",},
      pivot:[],
      sortstatus:0,
      loaddata:false,
      updateflag:false,
      autocomplete:[]
    };
  }

  render(){
    const cols = [
      {accessor: 'baseMaster_Code', Header: 'BaseMaster Code', Filter:"text"},
      {accessor: 'baseMaster_Name', Header: 'BaseMasterName', Filter:"text"},
      {accessor: 'packMaster_Code', Header: 'Pack Master Code', Filter:"text"},
      {accessor: 'packMaster_Name', Header: 'Pack Master Name', Filter:"text"},
      {accessor: 'customer_Code', Header: 'Customer Code', Filter:"text"},
      {accessor: 'customer_Name', Header: 'Customer Name', Filter:"text"},
      {accessor: 'code', Header: 'Code', Filter:"text", sortable:false},
      {accessor: 'objectType', Header: 'Name', Filter:"text", sortable:false},
      {accessor: 'skuMaster_Code', Header: 'SKU Master Code', Filter:"text", sortable:false},
      {accessor: 'skuMaster_Name', Header: 'SKU Master Name', Filter:"text", sortable:false},
      {accessor: 'batch', Header: 'Batch', Filter:"text", sortable:false},
      {accessor: 'lot', Header: 'Lot', Filter:"text", sortable:false},
      {accessor: 'packMaster_WeightKG', Header: 'Pack Master WeightKG', Filter:"text", sortable:false},
      {accessor: 'packMaster_WidthM', Header: 'Pack Master WidthM', Filter:"text", sortable:false},
      {accessor: 'packMaster_LengthM', Header: 'Pack Master LengthM', Filter:"text", sortable:false},
      {accessor: 'packMaster_HeightM', Header: 'Pack Master HeightM', Filter:"text", sortable:false},
      {accessor: 'packMaster_ItemQty', Header: 'Pack Master Qty', Filter:"text", sortable:false},
      {accessor: 'weigthKG', Header: 'WeigthKG', Filter:"text"},
      {accessor: 'widthM', Header: 'WidthM', Filter:"text"},
      {accessor: 'lengthM', Header: 'LengthM', Filter:"text"},
      {accessor: 'heightM', Header: 'HeightM', Filter:"text"},
      {accessor: 'branch_Code', Header: 'Branch Code', Filter:"text"},
      {accessor: 'branch_Name', Header: 'Branch Name', Filter:"text"},
      {accessor: 'warehouse_Code', Header: 'Warehouse Code', Filter:"text"},
      {accessor: 'warehouse_Name', Header: 'Warehouse Name', Filter:"text"},
      {accessor: 'areaMaster_Code', Header: 'AreaMaster Code', Filter:"text"},
      {accessor: 'areaMaster_Name', Header: 'AreaMaster Name', Filter:"text"},
      {accessor: 'areaLocationMaster_Bank', Header: 'AreaLocationMaster Bank', Filter:"text"},
      {accessor: 'areaLocationMaster_Bay', Header: 'AreaLocationMaster Bay', Filter:"text"},
      {accessor: 'areaLocationMaster_Level', Header: 'AreaLocationMaster Level', Filter:"text"},
      {accessor: 'holeStatus', Header: 'Hole Status'},
      {accessor: 'status', Header: 'Status', Cell:"checkbox" ,Filter:"dropdown"},
      {accessor: 'productDate', Header: 'Product Date', Cell:"datetime"},
      {accessor: 'expiryDate', Header: 'Expiry Date', Cell:"datetime"},
      {accessor: 'createBy', Header: 'CreateBy', Filter:"text"},
      {accessor: 'createTime', Header: 'CreateTime', Cell:"datetime"},
      {accessor: 'modifyBy', Header: 'ModifyBy', Filter:"text"},
      {accessor: 'modifyTime', Header: 'ModifyTime', Cell:"datetime"},
    ];

    let maincols = cols
    maincols.push({Header: '', Aggregated:"button",Cell:"button", filterable:false, sortable:false})

    const subcols = [{accessor: 'code', Header: 'STO', id: "code"},
    {accessor: 'code', Header: 'SKU Code'},
    {accessor: 'type', Header: 'STO Type'},
    {accessor: 'sumpack', Header: 'Sum Pack Qty'},
    {accessor: 'sumsku', Header: 'Sum SKU Qty'},
    {Header: '', Aggregated:"button",Cell:"button", filterable:false, sortable:false}
  ]

    const ddlfilter = [
    {
      'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
      'header' : 'Status',
      'field' : 'Status',
    }];

    const url = "https://localhost:44366/api/trx/sto/search/?stoID&objectType&holdStatus&eventStatus&status&productDate&expireDate&batch&lot&rootBaseCode&rootBaseTypeCode&rootBaseTypeName&sKUCode&sKUName&packCode&packName&branchCode&branchName&warehouseCode&warehouseName&areaCode&areaName&customerCode&customerName&s_f=ID&s_od=ASC&sk=0&l=222"
    return(
      <div>
        <ExtendTable data={this.state.select} column={maincols} subcolumn={subcols} dropdownfilter={ddlfilter} pivotBy={this.state.pivot} subtablewidth={700}
        url={url} filterable={true} subtype={1}/>
      </div>
    )
  }
}

export default Pallet;

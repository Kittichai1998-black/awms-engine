import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
import ExtendTable from '../MasterData/ExtendTable';
import Axios from 'axios';
import {createQueryString} from '../ComponentCore'


class Storage extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      dataedit:[],
      userAll:[],
      dataMap : [
        {datafield:"code",searchfield:"rootBaseCode"},
        {datafield:"baseMaster_Code",searchfield:"rootBaseTypeCode"},
        {datafield:"baseMaster_Name",searchfield:"rootBaseTypeName"},
        {datafield:"viewChildSKUMaster_Codes",searchfield:"sKUCode"},
        {datafield:"viewChildSKUMaster_Names",searchfield:"sKUName"},
        {datafield:"viewChildPackMaster_Codes",searchfield:"packCode"},
        {datafield:"viewChildPackMaster_Names",searchfield:"packName"},
        {datafield:"branch_Code",searchfield:"branchCode"},
        {datafield:"branch_Name",searchfield:"branchName"},
        {datafield:"warehouse_Code",searchfield:"warehouseCode"},
        {datafield:"warehouse_Name",searchfield:"warehouseName"},
        {datafield:"areaMaster_Code",searchfield:"areaCode"},
        { datafield: "areaMaster_Name", searchfield: "areaName" },
        { datafield:'areaLocationMaster_Code', searchfield:'locationCode'},
        {datafield:"holeStatus",searchfield:"holdStatus", Filter:"dropdown"},
        {datafield:"eventStatus",searchfield:"eventStatus", Filter:"dropdown"},
        {datafield:"status",searchfield:"status", Filter:"dropdown"},
        {datafield:"productDate",searchfield:"productDate"},
        {datafield:"expiryDate",searchfield:"expiryDate"},
      ],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/trx/sto/search",
      t:"",
      q:"",
      fields:"status < 2",
      s_f:"{rootBaseCode}",
      s_od:"{ASC}",
      sk:"",
      l:20,},
      pivot:[],
      sortstatus:0,
      loaddata:false,
      updateflag:false,
    };
    
    this.getSelectionData = this.getSelectionData.bind(this)
    this.getUserList = this.getUserList.bind(this)
  }

  componentWillMount(){
    this.getUserList();
  }
  
  getSelectionData(data){
    let obj = []
    data.forEach((datarow,index) => {
        obj.push({"ID":datarow.id,"HoleStatus":0});
    })
    const ObjStr = JSON.stringify(obj)
    this.setState({dataedit:obj}, () => console.log(this.state.dataedit))
  }

  onClickToDesc(data){
    return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da" }}
      onClick={() => this.history.push('/sys/storage/history?TYPEID=R&ID=' + data.id)}>History</Button>
  }

  getUserList(){
    const userselect = {queryString:window.apipath + "/api/mst",
      t:"User",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    Axios.all([Axios.get(createQueryString(userselect))]).then(
      (Axios.spread((userresult) => 
    {
      let list = []
      let userList = {}
      userList["data"] = userresult.data.datas

      list = list.concat(userList)
      this.setState({userAll:userresult.data.datas})
    })))
  }


  render(){
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center" , fixed: "left"},
      {accessor: 'viewChildPackMaster_Codes', Header: 'Pack Code', Filter:"text", fixed: "left"},
      {accessor: 'viewChildPackMaster_Names', Header: 'Pack Name', Filter:"text", fixed: "left"},
      {accessor: 'code', Header: 'Base Code', id: "ID", Filter:"text" , },
     /*  {accessor: 'baseMaster_Code', Header: 'Base Type Code', Filter:"text" },
      {accessor: 'baseMaster_Name', Header: 'Base Type Name', Filter:"text" }, */
      {accessor: 'viewChildPackMaster_Qty', Header: 'Pack Qty', filterable:false},
      /* {accessor: 'viewChildSKUMaster_Codes', Header: 'SKU Code', Filter:"text"},
      {accessor: 'viewChildSKUMaster_Names', Header: 'SKU Name', Filter:"text"},
      {accessor: 'viewChildSKUMaster_Qty', Header: 'SKU Qty', filterable:false}, */
      {accessor: 'branch_Code', Header: 'Branch Code', Filter:"text"},
      {accessor: 'branch_Name', Header: 'Branch Name', Filter:"text"},
      {accessor: 'warehouse_Code', Header: 'Warehouse Code', Filter:"text"},
      {accessor: 'warehouse_Name', Header: 'Warehouse Name', Filter:"text"},
      {accessor: 'areaMaster_Code', Header: 'Area Code', Filter:"text"},
      {accessor: 'areaMaster_Name', Header: 'Area Name', Filter:"text"},
      { accessor: 'areaLocationMaster_Code', Header: 'Location', Filter: "text" },
      {accessor: 'holeStatus', Header: 'Hold',  Status:"text", Filter:"dropdown"},
      {accessor: 'eventStatus', Header: 'Event',  Status:"text", Filter:"dropdown"},
      {accessor: 'status', Header: 'Status',  Status:"text", Filter:"dropdown"},
      {accessor: 'productDate', Header: 'Product Date', },
      {accessor: 'expiryDate', Header: 'Expire Date', },
      {accessor: 'createBy', Header: 'Create', filterable:false, Type:"codename"},
      {accessor: 'modifyBy', Header: 'Modify', filterable:false, Type:"codename"},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Link"},
    ];

    const btnfunc = [{
      history:this.props.history,
      btntype:"Link",
      func:this.onClickToDesc
    }]

    return(
      <div>
        <ExtendTable data={this.state.select} column={cols} childType="Tree" dataedit={this.state.dataedit} userlist={this.state.userAll}
        pivotBy={this.state.pivot} subtablewidth={700} getselection={this.getSelectionData} 
        url={null} btn={btnfunc} filterable={true} subtype={1} filterFields={this.state.dataMap}/>
      </div>
    )
  }
}

export default Storage;

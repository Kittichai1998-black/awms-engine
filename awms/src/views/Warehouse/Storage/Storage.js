import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
import ExtendTable from '../MasterData/ExtendTable';
import Axios from 'axios';

class Storage extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      dataedit:[],
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
        {datafield:"areaMaster_Name",searchfield:"areaName"},
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
    this.updateHold = this.updateHold.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this)
    //this.queryInitialData = this.queryInitialData.bind(this)
  }
  
  getSelectionData(data){
    let obj = []
    data.forEach((datarow,index) => {
        obj.push({"ID":datarow.id,"HoleStatus":0});
    })
    const ObjStr = JSON.stringify(obj)
    this.setState({dataedit:obj}, () => console.log(this.state.dataedit))
  }

  /* queryInitialData(data){
    if(data){
      if(this.props.url === null || this.props.url === undefined){
        const dataselect = data
        this.setState({dataselect:dataselect})
        let queryString = createQueryString(data)
        Axios.get(queryString).then(
        (res) => {
          this.setState({data:res.data.datas,loading:false})
        })        
      }
      else{
        Axios.get(this.props.url).then(
          (res) => {
              this.setState({data:res.data.datas,loading:false})
          })
      }
    }
  } */

  updateHold(status){
    const dataedit = this.state.dataedit
    let obj = []
    if (status === 'hold'){
      if(dataedit.length > 0){
        dataedit.forEach((row) =>{
          row["HoleStatus"]=1
        })
      }
       
    }else if(status === 'unhold'){
      if(dataedit.length > 0){
        dataedit.forEach((row) =>{
          row["HoleStatus"]=0
        })
      }
    }

    let updjson = {
      "_token": sessionStorage.getItem("Token"),
      "_apikey": null,
      "t": "amt_StorageObject",
      "pk": "ID",
      "datas": dataedit,
      "nr": false
    }
    console.log(updjson)
    Axios.put(window.apipath + "/api/mst", updjson).then((result) =>{
      //this.queryInitialData();
    })
    this.setState({dataedit:[]})
  }

  onClickToDesc(data){
    return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da" }}
      onClick={() => this.history.push('/sys/storage/history?TYPEID=R&ID=' + data.id)}>History</Button>
  }



  render(){
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center" , fixed: "left"},
      {accessor: 'code', Header: 'Base Code', id: "ID", Filter:"text" , fixed: "left"},
      {accessor: 'baseMaster_Code', Header: 'Base Type Code', Filter:"text" },
      {accessor: 'baseMaster_Name', Header: 'Base Type Name', Filter:"text" },
      {accessor: 'viewChildPackMaster_Codes', Header: 'Pack Code', Filter:"text"},
      {accessor: 'viewChildPackMaster_Names', Header: 'Pack Name', Filter:"text"},
      {accessor: 'viewChildPackMaster_Qty', Header: 'Pack Qty', filterable:false},
      {accessor: 'viewChildSKUMaster_Codes', Header: 'SKU Code', Filter:"text"},
      {accessor: 'viewChildSKUMaster_Names', Header: 'SKU Name', Filter:"text"},
      {accessor: 'viewChildSKUMaster_Qty', Header: 'SKU Qty', filterable:false},
      {accessor: 'branch_Code', Header: 'Branch Code', Filter:"text"},
      {accessor: 'branch_Name', Header: 'Branch Name', Filter:"text"},
      {accessor: 'warehouse_Code', Header: 'Warehouse Code', Filter:"text"},
      {accessor: 'warehouse_Name', Header: 'Warehouse Name', Filter:"text"},
      {accessor: 'areaMaster_Code', Header: 'Area Code', Filter:"text"},
      {accessor: 'areaMaster_Name', Header: 'Area Name', Filter:"text"},
      {accessor: 'areaLocationMaster_Code', Header: 'Location', filterable:false},
      {accessor: 'holeStatus', Header: 'Hold',  Status:"text", Filter:"dropdown"},
      {accessor: 'eventStatus', Header: 'Event',  Status:"text", Filter:"dropdown"},
      {accessor: 'status', Header: 'Status',  Status:"text", Filter:"dropdown"},
      {accessor: 'productDate', Header: 'Product Date', },
      {accessor: 'expiryDate', Header: 'Expire Date', },
      {accessor: 'createBy', Header: 'Create', filterable:false},
      {accessor: 'modifyBy', Header: 'Modify', filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Link"},
    ];

    const btnfunc = [{
      history:this.props.history,
      btntype:"Link",
      func:this.onClickToDesc
    }]

    return(
      <div>
        <ExtendTable data={this.state.select} column={cols} childType="Tree"
        pivotBy={this.state.pivot} subtablewidth={700} getselection={this.getSelectionData} 
        url={null} btn={btnfunc} filterable={true} subtype={1} filterFields={this.state.dataMap}/>
        <Card style={{display:'inlne-block',textAlign:'right'}}>
          <CardBody>
            <Button style={{ background: "#0095a8", borderColor: "#0095a8", width: '130px' }}
              onClick={() => this.updateHold("unhold")} color="primary" className="float-right" className="float-left">Unhold</Button>
            <Button style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px' }}
              onClick={() => this.updateHold("hold")} color="primary" className="float-right" className="float-left">Hold</Button>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default Storage;

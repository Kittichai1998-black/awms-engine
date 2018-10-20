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
        {datafield:"holeStatus",searchfield:"holeStatus", Filter:"dropdown"},
        {datafield:"status",searchfield:"status", Filter:"dropdown"},
        {datafield:"productDate",searchfield:"productDate"},
        {datafield:"expiryDate",searchfield:"expiryDate"},
      ],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/trx/sto/search",
      t:"",
      q:"",
      fields:"",
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
  }
  
  getSelectionData(data){
    console.log(data)
    let obj = []
    data.forEach((datarow,index) => {
        obj.push({"barcode":datarow.Code,"Name":datarow.Name});
    })
    const ObjStr = JSON.stringify(obj)
    this.setState({barcodeObj:ObjStr}, () => console.log(this.state.barcodeObj))
  }

  updateHold(){
    const dataedit = this.state.dataedit
    if(dataedit.length > 0){
      dataedit.forEach((row) => {
        row["ID"] = row["ID"] <= 0 ? null : row["ID"]
        this.props.column.forEach(col => {
          if(col.datatype === "int" && row[col.accessor] === ""){
            if(col.accessor === "Revision"){
              if(row[col.accessor] === ""){
                row[col.accessor] = 1
              }
            }
            else{
              row[col.accessor] = null
            }
          }
        })

        for(let col of this.props.uneditcolumn){
          delete row[col]
        }
      })
      let updjson = {
        "_token": sessionStorage.getItem("Token"),
        "_apikey": null,
        "t": this.props.table,
        "pk": "ID",
        "datas": dataedit,
        "nr": false
      }
      Axios.put(window.apipath + "/api/mst", updjson).then((result) =>{
        this.queryInitialData();
      })

      this.setState({dataedit:[]})
    }
}

  render(){
    const cols = [
      /* {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"}, */
      {accessor: 'code', Header: 'ฺBase Code', id: "ID", Filter:"text"},
      {accessor: 'baseMaster_Code', Header: 'Base Type Code', Filter:"text"},
      {accessor: 'baseMaster_Name', Header: 'Base Type Name', Filter:"text"},
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
      {accessor: 'holeStatus', Header: 'Hole',  Status:"text", Filter:"dropdown"},
      {accessor: 'status', Header: 'Status',  Status:"text", Filter:"dropdown"},
      {accessor: 'productDate', Header: 'Product Date', Filter:"text"},
      {accessor: 'expiryDate', Header: 'Expire Date', Filter:"text"},
      {accessor: 'createBy', Header: 'Create', filterable:false},
      {accessor: 'modifyBy', Header: 'Modify', filterable:false},
    ];

    const subcols = [
      {accessor: 'ID', Header: 'Log ID', id: "ID", }, 
      {accessor: 'Code', Header: 'Code', id: "Code", },
      {accessor: 'sumsku', Header: 'sumsku', id: "sumsku", },
    ];

    const objselect = this.state.select
    /* const values = queryString.parse(this.props.location.search) */
    console.log(objselect)

    return(
      <div>
        <ExtendTable data={objselect} column={cols} subcolumn={subcols} /* dropdownfilter={this.state.statuslist} */ 
        pivotBy={this.state.pivot} subtablewidth={700} getselection={this.getSelectionData}
        url={null} filterable={true} subtype={1} filterFields={this.state.dataMap}/>
        {/* <Card style={{display:this.state.accept === true ? 'inlne-block' : 'none'}}>
          <CardBody>
            <Button onClick={() => this.updateHold("hold")} color="primary"className="mr-sm-1">Hold</Button>
            <Button onClick={() => this.updateHold("unhold")} color="primary"className="mr-sm-1">Unhold</Button>
          </CardBody>
        </Card> */}
      </div>
    )
  }
}

export default History;

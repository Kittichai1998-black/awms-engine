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
      {accessor: 'code', Header: 'ฺBase Code', id: "ID", filterable:false},
      {accessor: 'baseMaster_Code', Header: 'Base Type Code', Filter:"text"},
      {accessor: 'baseMaster_Name', Header: 'Base Type Name', },
      {accessor: 'viewChildPackMaster_Codes', Header: 'Pack Code', },
      {accessor: 'viewChildPackMaster_Names', Header: 'Pack Name', },
      {accessor: 'viewChildPackMaster_Qty', Header: 'Pack Qty', },
      {accessor: 'viewChildSKUMaster_Codes', Header: 'SKU Code', },
      {accessor: 'viewChildSKUMaster_Names', Header: 'SKU Name', },
      {accessor: 'viewChildSKUMaster_Qty', Header: 'SKU Qty', },
      {accessor: 'branch_Code', Header: 'Branch Code', },
      {accessor: 'branch_Name', Header: 'Branch Name', },
      {accessor: 'warehouse_Code', Header: 'Warehouse Code', },
      {accessor: 'warehouse_Name', Header: 'Warehouse Name', },
      {accessor: 'areaMaster_Code', Header: 'Area Code', },
      {accessor: 'areaMaster_Name', Header: 'Area Name', },
      {accessor: 'areaLocationMaster_Code', Header: 'Location', },
      {accessor: 'holeStatus', Header: 'Hole',  Status:"text"},
      {accessor: 'status', Header: 'Status',  Status:"text"},
      {accessor: 'productDate', Header: 'Product Date',},
      {accessor: 'expiryDate', Header: 'Expire Date', },
      {accessor: 'createBy', Header: 'Create', },
      {accessor: 'modifyBy', Header: 'Modify', },
    ];

    const subcols = [
      {accessor: 'ID', Header: 'Log ID', id: "ID", }, 
      {accessor: 'Code', Header: 'Code', id: "Code", },
      {accessor: 'sumsku', Header: 'sumsku', id: "sumsku", },
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
        <ExtendTable data={objselect} column={cols} subcolumn={subcols} dropdownfilter={ddlfilter} 
        pivotBy={this.state.pivot} subtablewidth={700} getselection={this.getSelectionData}
        url={null} filterable={true} subtype={1}/>
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

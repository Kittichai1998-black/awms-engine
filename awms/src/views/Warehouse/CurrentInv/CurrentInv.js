import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
import { apicall, DatePicker, createQueryString } from '../ComponentCore'
import Workbook from 'react-excel-workbook'
import Axios from 'axios'




const API = new apicall()

class CurrentInv extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data: [],
   
    }

    this.CurrentItem = {
      queryString: window.apipath + "/api/viw",
      t: "CurrentInv",
      q: "[{ 'f': 'Status', c:'=', 'v': 1}]",
      f: "ID,Pack,Warehouse,Total",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      l: 100,
      all: "",
      sortstatus: 0,
      selectiondata: [],
    }

    this.dateTimePicker = this.dateTimePicker.bind(this)
    this.initialData = this.initialData.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this);
 

  }

  getSelectionData(data) {
    this.setState({ selectiondata: data }, () => console.log(this.state.selectiondata))
  }


  initialData() {
    API.get(window.apipath + "/api/wm/audit/reconcile/fileserver").then(Response => {
      this.setState({ dataExcel: Response.data.datas },() =>console.log(this.state.dataExcel))
      
    })
   
  }
 
  //HeaderData() {
  //    let objs = []
  //    if (this.state.dataExcel.length > 0) {
  //      for (let dataEx in this.state.dataExcel[0]) {
  //        objs.push(<Workbook.Column label="Bar" value="bar" />)
  //      }
  //    }
  //    return obj    
  //}
  
  dateTimePicker() {
    return <DatePicker onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD/MM/YYYY" />
  }

  componentDidMount() {
    this.initialData()
    }

  ExportData() {
      if (this.state.date) {
        let postdata = {
          "exportName": "DocumentAuditToCD",
          "whereValues": [this.state.date]
        }
        let resultPath = postdata.fileExport
        API.post(window.apipath + "/api/report/export/fileServer", postdata).then(res => {
          window.success(resultPath + "<br/>" + res.data.fileExport)
        })
      }
    }

  render() {
    const cols = [
      { accessor: 'Pack', Header: 'Pack Code/Name',Filter: "text" },
      { accessor: 'Warehouse', Header: 'Warehouse',Filter: "text"},
      { accessor: 'Total', Header: 'Total Qty', Filter: "text" },
 
    ];
    const dataEcel= this.state.dataExcel

    return (
      <div>
     <div className="clearfix">
          <Workbook filename="CurrentInv.xlsx" element={
            <Button style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '150px'}} color="primary" className="float-right"
            >Dowload Reconsign </Button>}>
            <Workbook.Sheet data={dataEcel} name="Sheet A">
              <Workbook.Column label="PackCode" value="packCode"  />
              <Workbook.Column label="PackName" value="packName" />
              <Workbook.Column label="Warehouse" value="warehouse" />
              <Workbook.Column label="PackQtyWMS" value={row =>""+ row.packQtyWMS} />
              <Workbook.Column label="PackQtyERP" value={row => "" + row.packQtyERP} />
              <Workbook.Column label="PackQtyResult" value={row => "" + row.packQtyResult}/>
            </Workbook.Sheet>
          </Workbook>
          <Button style={{ background: "#26c6da", borderColor: "#26c6da", width: '150px', marginRight:"5px" }} color="primary" className="float-right"
            onClick={() => { this.ExportData() }}>Export Data</Button>
          <div className="float-right" style={{ marginRight: "5px" }}>{this.dateTimePicker()}</div>
 
      </div>
        <TableGen column={cols}
          data={this.CurrentItem}
          filterable={true} uneditcolumn={this.uneditcolumn} getselection={this.getSelectionData} 
          table="CurrentInv" />
        </div>     
    )
  }
}

export default CurrentInv;

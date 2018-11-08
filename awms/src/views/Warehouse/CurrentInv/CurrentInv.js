import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
import { apicall, DatePicker } from '../ComponentCore'
import Workbook from 'react-excel-workbook'
import Axios from 'axios'




const createQueryString = (select) => {
  let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
    + (select.q === "" ? "" : "&q=" + select.q)
    + (select.f === "" ? "" : "&f=" + select.f)
    + (select.g === "" ? "" : "&g=" + select.g)
    + (select.s === "" ? "" : "&s=" + select.s)
    + (select.sk === "" ? "" : "&sk=" + select.sk)
    + (select.l === 0 ? "" : "&l=" + select.l)
    + (select.all === "" ? "" : "&all=" + select.all)
  return queryS
}

const API = new apicall()

class CurrentInv extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],

    }

    this.CurrentItem = {
      queryString: window.apipath + "/api/viw",
      t: "CurrentInv",
      q: "",
      f: "ID,PackCode,PackName,Warehouse,Total, concat(PackCode, ':' ,PackName)as Pack",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      l: 20,
      all: "",
    }

    this.dateTimePicker = this.dateTimePicker.bind(this)
    this.initialData = this.initialData.bind(this)
    
  }


  initialData() {
    Axios.get("https://api.myjson.com/bins/e1qwe").then(Response => {
      this.setState({ dataExcel: Response.data },() =>console.log(this.state.dataExcel))
      
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
        API.post(window.apipath + "/api/report/export/fileServer", postdata)
      }
    }

  render() {
    const cols = [
      { accessor: 'Pack', Header: 'Pack Code/Name', editable: false, filterable: false },
      { accessor: 'Warehouse', Header: 'Warehouse', editable: false, filterable: false},
      { accessor: 'Total', Header: 'Total Qty', editable: false, filterable: false },
 
    ];
    const dataEcel= this.state.dataExcel

    return (
      <div>
     <div className="clearfix">
          <Workbook filename="CurrentInv.xlsx" element={
            <Button style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px'}} color="primary" className="float-right"
            >Export Excel</Button>}>
            <Workbook.Sheet data={dataEcel} name="Sheet A">
              <Workbook.Column label="Code" value="code" />
              <Workbook.Column label="Name" value="name" />
              <Workbook.Column label="Qtyamw" value="qtyamw" />
              <Workbook.Column label="Qtyerp" value="qtyerp" />
              <Workbook.Column label="Total" value="total" />
            </Workbook.Sheet>
          </Workbook>
          <Button style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', marginRight:"5px" }} color="primary" className="float-right"
            onClick={() => { this.ExportData() }}>Export Data</Button>
          <div className="float-right" style={{ marginRight: "5px" }}>{this.dateTimePicker()}</div>
 
      </div>
        <TableGen column={cols}
          data={this.CurrentItem}
          filterable={true} uneditcolumn={this.uneditcolumn}
          table="CurrentInv" />
        </div>     
    )
  }
}

export default CurrentInv;

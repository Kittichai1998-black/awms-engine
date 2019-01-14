import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../MasterData/TableSetup';
import { apicall, DatePicker, createQueryString } from '../ComponentCore'
import Workbook from 'react-excel-workbook'
import Axios from 'axios'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

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
    this.getSelectionData = this.getSelectionData.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)


  }
  async componentWillMount() {
    document.title = "Current Inventory : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("CUR_INV", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  //   40	WarehouseCI_view
  // 41	WarehouseCI_execute
  // อันเก่า  
  // let i = [42]
  //   i.forEach(row => {
  //     if (row === 41) { //WarehouseCI_execute
  //       check = true
  //     } else if (row === 42) {//SKU_view

  //       check = false
  //     }
  //   })
  displayButtonByPermission(dataGetPer) {
    let check = true
    if (CheckViewCreatePermission("WarehouseCI_view", dataGetPer)) {
      check = true 
    }
    if (CheckViewCreatePermission("WarehouseCI_execute", dataGetPer)) {
      check = false 
    }
    if (check === true) {
      var PerButtonDate = document.getElementById("per_button_date")
      PerButtonDate.remove()
      var PerButtonExport = document.getElementById("per_button_export")
      PerButtonExport.remove()
      var PerButtonDowload = document.getElementById("per_button_dowload")
      PerButtonDowload.remove()
    } else if (check === false) {
      this.setState({ showbutton: "block" })
    } else {
      this.props.history.push("/404")
    }
  }
  //permission

  getSelectionData(data) {
    this.setState({ selectiondata: data }, () => console.log(this.state.selectiondata))
  }

  initialData() {
    API.get(window.apipath + "/api/wm/audit/reconcile/fileserver").then(Response => {
      this.setState({ dataExcel: Response.data.datas }, () => console.log(this.state.dataExcel))

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
      { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
      { accessor: 'Pack', Header: 'Pack Code/Name', Filter: "text", minWidth: 250 },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: "text", minWidth: 120 },
      { accessor: 'Total', Header: 'Total Qty', Filter: "text", className: 'right', minWidth: 90, maxWidth: 90 },

    ];
    const dataEcel = this.state.dataExcel

    return (

      <div>
        <div className="clearfix" id="per_button_dowload" style={{ display: this.state.showbutton }}>


        </div>

        <TableGen column={cols}
          data={this.CurrentItem}
          filterable={true} uneditcolumn={this.uneditcolumn} getselection={this.getSelectionData} exportfilebtn={true} expFilename={"CurrentInventory"}
          table="CurrentInv" />
        <div>

        </div>
      </div>
    )
  }
}

export default CurrentInv;

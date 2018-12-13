import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../MasterData/TableSetup';
import { apicall, DatePicker, createQueryString } from '../ComponentCore'
import Workbook from 'react-excel-workbook'
import Axios from 'axios'
import {GetPermission,Nodisplay} from '../../ComponentCore/Permission';

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
    this.getSelectionData = this.getSelectionData.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
 

  }
  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data = await GetPermission()
    Nodisplay(data,42,this.props.history)
    this.displayButtonByPermission(data)
    //permission

  }
  //permission
  displayButtonByPermission(perID){
    this.setState({perID:perID})
    let check = false
    let i= [42]
    i.forEach(row => {
        if(row === 41){
          check = true
        }else if(row === 42){
          check = false
        }
      })
        if(check === true){  
            var PerButtonDate= document.getElementById("per_button_date")
            PerButtonDate.remove()     
            var PerButtonExport = document.getElementById("per_button_export")
            PerButtonExport.remove()    
            var PerButtonDowload = document.getElementById("per_button_dowload")
            PerButtonDowload.remove()
        }else if(check === false){
            this.setState({showbutton:"block"})
        }else{
            this.props.history.push("/404")
        } 
  }
  //permission

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
     <div className="clearfix" id="per_button_dowload" style={{display:this.state.showbutton}}>
          
 
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

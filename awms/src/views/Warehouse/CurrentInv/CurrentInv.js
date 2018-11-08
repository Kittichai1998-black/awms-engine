import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
import { apicall, DatePicker } from '../ComponentCore'
import Workbook from 'react-excel-workbook'



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

const data1 = [
  {
    foo: '123',
    bar: '456',
    baz: '789'
  },
  {
    foo: 'abc',
    bar: 'dfg',
    baz: 'hij'
  },
  {
    foo: 'aaa',
    bar: 'bbb',
    baz: 'ccc'
  }
]

const data2 = [
  {
    aaa: 1,
    bbb: 2,
    ccc: 3
  },
  {
    aaa: 4,
    bbb: 5,
    ccc: 6
  }
]

class CurrentInv extends Component{
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
    

   

  }



  initialData() {
    API.get("https://api.myjson.com/bins/194yke").then(Response => {
      this.setState({ dataExel: Response.data })
    })
    
  }


  HeaderData() {
    
      let objs = []
      if (this.state.dataExel.length > 0) {
        for (let dataEx in this.state.dataExel[0]) {
          objs.push(<Workbook.Column label="Bar" value="bar" />)
        }

      }
      return objs
    

  }
  

  dateTimePicker() {
    return <DatePicker onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD/MM/YYYY" />
  }


    componentDidMount() {
      API.get(createQueryString(this.CurrentItem)).then(current => { })
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

    return (

      <div>


        <Helmet>
          <Script type="text/javascript" src="jqury-3.3.1.min.js"></Script>
          <Script type="text/javascript" src="xlsx.full.min.js"></Script>
          <Script type="text/javascript" src="angular.min.js"></Script>
          <Script type="text/javascript" src="Readdata.js"></Script>
         
        </Helmet>



       


        <div className="clearfix">

          <Button style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px' }} color="primary" className="float-right"
            onClick={() => { this.ExportData() }}>Export Data</Button>
          <div className="float-right" style={{ marginRight: "5px" }}>{this.dateTimePicker()}</div>

          <Button style={{ background: "#66bb6a", borderColor: "#26c6da", width: '130px', marginRight: "465px" }} color="primary" className="float-right"
            onClick={() => { this.initialData }}>Browse</Button>
          
      

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

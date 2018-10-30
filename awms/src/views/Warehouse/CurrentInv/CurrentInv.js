import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
//import Axios from 'axios';
import { apicall } from '../ComponentCore'
import moment from 'moment';
//import DatePicker from 'react-datepicker';

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
 
class CurrentInv extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }
    
   this.CurrentItem = {
        queryString: window.apipath + "/api/viw",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1001},{'f':'Status','c':'!=','v':2}]",
        f: "Code,DesBranch,DesWarehouse,DesArea",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 10,
      all: "",
   }


  
  }

  

    componentDidMount() {
      API.get(createQueryString(this.CurrentItem)).then(current => { })
    }





    //ExportData() {
    //  if (this.state.date) {
    //    let postdata = {
    //      "exportName": "DocumentAuditToCD",
    //      "whereValues": [this.state.date]
    //    }
    //    API.post(window.apipath + "/api/report/export/fileServer", postdata)
    //  }
    //}
  
  render() {
    const cols = [
      { accessor: 'Code', Header: 'Pack Code/Name', editable: false, filterable: false },
      { accessor: 'DesBranch', Header: 'SKU Code/Name', editable: false, filterable: false},
      { accessor: 'DesWarehouse', Header: 'Warehouse', editable: false, filterable: false},
      { accessor: 'DesArea', Header: 'Total', editable: false, filterable: false },

  
    ];

    return (

      <div>
        <div className="clearfix">
          <Button style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px' }} color="primary" className="float-right">Export Data</Button>
        <div className="float-right"></div>
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

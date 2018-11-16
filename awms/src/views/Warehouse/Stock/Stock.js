import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
//import Axios from 'axios';
import { apicall } from '../ComponentCore';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {GetPermission,Nodisplay} from '../../ComponentCore/Permission';



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
const getMapSto = true


class Stock extends Component{
  constructor(props) {
    super(props);
    this.state = {
      getMapSto: true
    
   }

    this.stockItem ={
      queryString: window.apipath + "/api/trx",
      t: "Document",
      q: "[{ 'f': 'DocumentType_ID', c:' = ', 'v': 2003}]",
      f: "ID, Code,DocumentDate,EventStatus,Status,CreateTime,ModifyTime,Remark",
      g: "",
      s: "[{'f':'Code','od':'asc'}]",
      sk: 0,
      l: 20,
      all: "",}

    
  }
  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data = await GetPermission()
    Nodisplay(data,36,this.props.history)
    
    //permission
  }
 

  componentDidMount() {

    API.get(createQueryString(this.stockItem)).then(stocks => {})
  }

workingData(){
    if(this.state.date){
      let postdata = {
        "exportName":"DocumentAuditToCD",
        "whereValues":[this.state.date]
      }
      API.post(window.apipath + "/api/report/export/fileServer", postdata)
    }
  }

  createDetial(rowdata) {
    return <Button type="button" color="primary" style={{ background: "##26c6da", borderColor: "#26c6da" }}
      onClick={() => this.history.push('/doc/stc/list?docID=' + rowdata.ID)
      }>Detail</Button>
  }




  render() {
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: false, filterable: false  },
      { accessor: 'DocumentDate', Header: 'Document Date', editable: false, filterable: false, Type: "datetime", dateformat: "datetime" },
      { accessor: 'EventStatus', Header: 'Event Status', sortable: false, editable: false, filterable: false, Type: "EventStatus",  },
      { accessor: 'Status', Header: 'Status', editable: false, filterable: false, Type: "DocumentStatus"  },
      { accessor: 'CreateTime', Header: 'Create', editable: false, filterable: false, Type: "datetime", dateformat: "datetime" },
      { accessor: 'ModifyTime', Header: 'Modify', editable: false, Type: "datetime", dateformat: "datetime", filterable: false },
      { accessor: 'Remark', Header: 'Remark', editable: false, filterable: false },
      { Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Detail", btntext: "Detail" },
   
      /* {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"}, */
    ];

    const btnfunc = [{
      history: this.props.history,
      btntype: "Detail",
      func: this.createDetial

    }]
 
    return(
      
      <div>
        <Card>
        </Card>   
        <TableGen column={cols} 
          data={this.stockItem}  
          filterable={true} uneditcolumn={this.uneditcolumn}
          btn={btnfunc} 
          table="storck" />
      </div>
    )
  }
}

export default Stock;

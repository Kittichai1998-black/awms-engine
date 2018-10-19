import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
//import Axios from 'axios';
import { apicall } from '../ComponentCore'
import DatePicker from 'react-datepicker';
import moment from 'moment';




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
    return <Button type="button" color="info"
      onClick={() => this.history.push('/mst/warehouse/Stockview/manage?docID=' + rowdata.ID)
      }>Detail</Button>
  }




  render() {
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: false, filterable: false  },
      { accessor: 'DocumentDate', Header: 'Document Date', editable: false, filterable: false },
      { accessor: 'EventStatus', Header: 'Event Status', sortable: false, editable: false, filterable: false  },
      { accessor: 'Status', Header: 'Status', editable: false, filterable: false  },
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
          <CardBody>
            <Button style={{ display: "inline-block" }} onClick={() => this.workingData()} color="primary" className="mr-sm-1 float-right">Export Server</Button>
            <div className="float-right" style={{ display: "inline-block", paddingRight: "10px" }}>
              <DatePicker selected={this.state.date}
                onChange={(e) => { this.setState({ date: e }) }}
                onChangeRaw={(e) => {
                  if (moment(e.target.value).isValid()) {
                    this.setState({ date: e.target.value })
                  }
                }}
                dateFormat="DD/MM/YYYY" />
            </div>
          </CardBody>
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

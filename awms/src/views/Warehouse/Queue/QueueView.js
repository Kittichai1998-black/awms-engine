import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import ReactTable from 'react-table';
import queryString from 'query-string'
import { apicall, createQueryString } from '../ComponentCore';
//import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

const API = new apicall()

class QueueView extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
    }

    this.select = {
      queryString: window.apipath + "/api/viw",
      t: "WorkQueue",
      q: "",
      f: "Row,Seq,IOType,StorageObject_Code,RefID,Priority,EventStatus,Pack_Name,Sou_Warehouse_Name,Des_Warehouse_Name," +
        "Sou_Area_Name,Des_Area_Name,Sou_AreaLocation_Name,Des_AreaLocation_Name,UserName,CreateTime,Document_Code",
      g: "",
      s: "[{'f':'Row','od':'asc'}]",
      sk: 0,
      l: 20,
      all: "",
    }

    this.GetQueueData = this.GetQueueData.bind(this)
  }

  // async componentWillMount() {
    
  //   //let dataGetPer = await GetPermission()
  //   //CheckWebPermission("QueueView", dataGetPer, this.props.history);
  //   //this.displayButtonByPermission(dataGetPer)
  // }

  // displayButtonByPermission(dataGetPer) {
  //   //70 Queue_view
  //   // 57	ReProgress_view
  //   // 60	IssuProgress_view
  //   // if (!CheckViewCreatePermission("ReProgress_view", dataGetPer) || !CheckViewCreatePermission("IssuProgress_view", dataGetPer)) {
  //   //   this.props.history.push("/404")
  //   // }
  // }

  componentDidMount() {
    const values = queryString.parse(this.props.location.search)
    if(values.IOType === "IN"){
      document.title = "Receiving Progress : AWMS";
    }
    if(values.IOType === "OUT"){
      document.title = "Issuing Progress : AWMS";
    }
    var url = this.select;
    url.q = "[{ 'f': 'IOType', c:'=', 'v': '" + values.IOType + "'}]";
    this.GetQueueData(url)

    let interval = setInterval(() => { this.GetQueueData(url) }, 2000);
    this.setState({ interval: interval })
  }

  componentWillUnmount() {
    clearInterval(this.state.interval)
  }

  GetQueueData(url) {
    API.get(createQueryString(url)).then(res => {
      this.setState({ data: res.data.datas });
    })
  }

  render() {
    const cols = [{ accessor: "Row", Header: "No.", className: 'center', minWidth: 40 },
    { accessor: "IOType", Header: "IOType", minWidth: 50, className: 'center' },
    { accessor: "Priority", Header: "Priority", minWidth: 60, className: 'center' },
    { accessor: "Document_Code", Header: "Document" },
    { accessor: "RefID", Header: "SAP Document" },
    { accessor: "StorageObject_Code", Header: "Pallet", minWidth: 95 },
    { accessor: "Pack_Name", Header: "Pack", minWidth: 290 },
    { accessor: "Des_AreaLocation_Name", Header: "Des" },
    { accessor: "StartTime", Header: "Start", filterable: false },
    { accessor: "EndTime", Header: "End", filterable: false }]
    return (
      <div>
        <div className="clearfix">
          <div className="float-right">
            <Button color="success" style={{ marginRight: '5px' }}>Create By Issue</Button>
            <Button color="primary">Create By PI</Button>
          </div>
        </div>
        <ReactTable columns={cols} data={this.state.data} filterable={true} minRows={10} defaultPageSize={10000} showPagination={false}
          style={{ background: 'white' }}
          getTrProps={(state, rowInfo) => {
            if (rowInfo !== undefined) {
              if (rowInfo.original.EventStatus === 11) {
                return { className: "working" }; //yellow
              }
              else if (rowInfo.original.EventStatus === 12) {
                return { className: "success" }; //green
              }
              else if (rowInfo.original.EventStatus === 90) {
                return { className: "error" }; //red
              }
              else if (rowInfo.original.EventStatus === 24) {
                return { className: "cancel" }; //gray
              }
              else {
                return {}
              }
            }
            else {
              return {}
            }
          }} />
      </div>
    )
  }
}

export default QueueView;

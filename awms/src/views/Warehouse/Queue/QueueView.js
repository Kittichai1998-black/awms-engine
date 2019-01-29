import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import ReactTable from 'react-table';
import queryString from 'query-string'
import { apicall, createQueryString } from '../ComponentCore';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

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
      s: "[{'f':'Row','od':'desc'}]",
      sk: 0,
      l: 20,
      all: "",
    }

    this.GetQueueData = this.GetQueueData.bind(this)
  }

  async componentWillMount() {
    if (this.props.location.search) {
      const search = queryString.parse(this.props.location.search)
      this.setState({ locsearch: search.IOType }, () =>
        this.setState({ pathname: this.props.location.pathname }))
    } else {
      this.props.history.push("/404")
    }
    let dataGetPer = await GetPermission()
    this.displayButtonByPermission(dataGetPer)
  }

  displayButtonByPermission(dataGetPer) {
    //   // 57	ReProgress_view
    //   // 60	IssuProgress_view
    if (this.state.pathname) {
      if (this.state.locsearch === "IN") {
        if (this.state.pathname === "/sys/gr/progress") {
          if (!CheckViewCreatePermission("ReProgress_view", dataGetPer)) {
            this.props.history.push("/404")
          } else {
            document.title = "Receiving Progress : AWMS";
          }
        } else {
          this.props.history.push("/404")

        }
      }
      if (this.state.locsearch === "OUT") {
        if (this.state.pathname === "/sys/gi/progress") {
          if (!CheckViewCreatePermission("IssuProgress_view", dataGetPer)) {
            this.props.history.push("/404")
          } else {
            document.title = "Issuing Progress : AWMS";
          }
        } else {
          this.props.history.push("/404")

        }
      }
    }
  }

  componentDidMount() {
    if (this.state.locsearch) {
      var url = this.select;
      url.q = "[{ 'f': 'IOType', c:'=', 'v': '" + this.state.locsearch + "'}]";
      this.GetQueueData(url)
      let interval = setInterval(() => { this.GetQueueData(url) }, 2000);
      this.setState({ interval: interval })
    }
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
    { accessor: "Des_AreaLocation_Name", Header: "Destination" },
    { accessor: "StartTime", Header: "Start",  },
    { accessor: "EndTime", Header: "End",}]
    return (
      <div>
        <div className="clearfix">
    
        </div>
        <ReactTable columns={cols} data={this.state.data} minRows={10} defaultPageSize={10000} showPagination={false}
          style={{ background: 'white', marginBottom: '10px' }} multiSort={false}
          getTrProps={(state, rowInfo) => {
            if (rowInfo !== undefined) {
              if (rowInfo.original.EventStatus === 11) {
                return { className: "working" }; //yellow
              }
              else if (rowInfo.original.EventStatus === 12) {
                return { className: "worked" }; //blue
              }
              else if (rowInfo.original.EventStatus === 32) {
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

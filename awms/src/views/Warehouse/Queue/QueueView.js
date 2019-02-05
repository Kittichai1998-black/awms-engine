import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import ReactTable from 'react-table';
import queryString from 'query-string'
import moment from 'moment';
import { apicall, createQueryString } from '../ComponentCore';
import Fullscreen from "react-full-screen";
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
      f: "Destination,Status,ActualTime,StartTime,EndTime,Seq,IOType,StorageObject_Code,RefID,Priority,EventStatus,Pack_Name,Sou_Warehouse_Name,Des_Warehouse_Name," +
        "Sou_Area_Name,Des_Area_Name,Sou_AreaLocation_Name,Des_AreaLocation_Name,UserName,CreateTime,Document_Code",
      g: "",
      s: "[{'f':'ActualTime','od':'DESC'}]",
      sk: 0,
      l: 100,
      all: "",
      //ORDER BY CASE WHEN wq.Status = 1 THEN wq.Status END ASC, 
      //CASE WHEN wq.Status = 0 THEN wq.Status END DESC, CASE WHEN wq.Status = 3 THEN wq.Status END DESC
    }
    this.selectCheck = {
      queryString: window.apipath + "/api/trx",
      t: "WorkQueue",
      q: "",
      f: "ID",
      g: "",
      s: "[{'f':'ID','od':'desc'}]",
      sk: 0,
      l: 1,
      all: "",
    }

    this.GetQueueData = this.GetQueueData.bind(this)
  }

  async componentWillMount() {
    const search = queryString.parse(this.props.location.search)
    this.setState({ locsearch: search.IOType, pathname: this.props.location.pathname })
  }

  displayButtonByPermission(dataGetPer) {
    //   // 57	ReProgress_view
    //   // 60	IssuProgress_view
    if (this.state.pathname) {
      if (this.state.locsearch === "IN") {
        if (this.state.pathname === "/sys/gr/progress") {
          document.title = "Receiving Progress : AWMS";
          // if (!CheckViewCreatePermission("ReProgress_view", dataGetPer)) {
          //   this.props.history.push("/404")
          // }
        } else {
          this.props.history.push("/404")
        }
      }
      if (this.state.locsearch === "OUT") {
        if (this.state.pathname === "/sys/gi/progress") {
          document.title = "Issuing Progress : AWMS";
          // if (!CheckViewCreatePermission("IssuProgress_view", dataGetPer)) {
          //   this.props.history.push("/404")
          // }  
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

      var urlCheck = this.selectCheck;
      urlCheck.q = "[{ 'f': 'IOType', c:'=', 'v': '" + (this.state.locsearch === "IN" ? "0" : "1") + "'}]";
      this.GetQueueData(urlCheck)

      // API.get(createQueryString(this.selectCheck)).then(check => {

      //   console.log(check)

      // })

      let interval = setInterval(() => { 
        API.get(createQueryString(urlCheck)).then(res => {
          
          console.log(res.data.datas[0].ID)
          if(this.state.queueID !== res.data.datas[0].ID){
            this.GetQueueData(url)
          }
          this.setState({ queueID: res.data.datas[0].ID });
        })
      }, 2000);
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

  datetimeBody(value, format) {
    if (value !== null) {
      const date = moment(value);
      if (format === "date") {
        return <div>{date.format('HH:mm:ss')}</div>
      } else if (format === "datelog") {
        return <div>{date.format('DD-MM-YYYY HH:mm:ss')}</div>
      } else {
        return <div>{date.format('DD-MM-YYYY HH:mm')}</div>
      }
    }
  }

  render() {
    const cols = [
      // { accessor: "Row", Header: "No.", className: 'center', minWidth: 40 },
      {
        Header: "No.",
        id: "row",
        width: 50,
        filterable: false,
        className: 'center',
        Cell: (row) => {
          return <div>{row.index + 1}</div>;
        }
      },
      {
        accessor: "ActualTime", Header: "Actual Time", className: 'center', width: 100, Cell: (e) =>
          this.datetimeBody(e.value, "date")
      },
      // { accessor: "IOType", Header: "IOType", minWidth: 50, className: 'center' },
      { accessor: "Priority", Header: "Priority", width: 70, className: 'center' },
      { accessor: "StorageObject_Code", Header: "Pallet", width: 100 },
      { accessor: "Pack_Name", Header: "Product" },
      { accessor: "Destination", Header: "Destination", width: 150 },
      { accessor: "Document_Code", Header: "Doc No.", width: 130 },
      { accessor: "RefID", Header: "SAP.Doc No.", width: 130 },
    ]

    return (
      <div>
        <div className="clearfix">

        </div>
        <ReactTable columns={cols} data={this.state.data} minRows={30} showPagination={false}
          style={{ background: 'white', marginBottom: '10px', fontSize: '1.125em', maxHeight: '34em', fontWeight: '450' }} multiSort={false}
          getTrProps={(state, rowInfo) => {
            if (rowInfo !== undefined) {
              if (rowInfo.original.Status === 3) {
                return { className: "inqueue" }; //white
              }
              else if (rowInfo.original.Status === 1) {
                return { className: "working" }; //yellow
              }
              else if (rowInfo.original.Status === 0) {
                return { className: "working" }; //yellow
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

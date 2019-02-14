import React, { Component } from 'react';
import "react-table/react-table.css";
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import ReactTable from 'react-table';
import queryString from 'query-string'
import moment from 'moment';
import { apicall, createQueryString } from '../ComponentCore';
import Fullscreen from "react-full-screen";
import Clock from 'react-live-clock';
import logo from '../../../assets/img/brand/Logo-AMW2.png'
import API from 'axios';

const iconexpand = <img style={{ width: "3em", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00NzYuOTUsMEgxMi4zNWMtNi44LDAtMTIuMiw1LjUtMTIuMiwxMi4yVjIzNWMwLDYuOCw1LjUsMTIuMiwxMi4yLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4yVjI0LjVoNDQwLjJ2NDQwLjJoLTIxMS45ICAgIGMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zczUuNSwxMi4zLDEyLjMsMTIuM2gyMjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjEyLjNDNDg5LjI1LDUuNSw0ODMuNzUsMCw0NzYuOTUsMHoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMC4wNSw0NzYuOWMwLDYuOCw1LjUsMTIuMywxMi4yLDEyLjNoMTcwLjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjMwNi42YzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gxMi4zNSAgICBjLTYuOCwwLTEyLjIsNS41LTEyLjIsMTIuM3YxNzAuM0gwLjA1eiBNMjQuNTUsMzE4LjhoMTQ1Ljl2MTQ1LjlIMjQuNTVWMzE4Ljh6IiBmaWxsPSIjMTE1OThjIi8+CgkJPHBhdGggZD0iTTIyMi45NSwyNjYuM2MyLjQsMi40LDUuNSwzLjYsOC43LDMuNnM2LjMtMS4yLDguNy0zLjZsMTM4LjYtMTM4Ljd2NzkuOWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNzMTIuMy01LjUsMTIuMy0xMi4zICAgIFY5OC4xYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM2gtMTA5LjVjLTYuOCwwLTEyLjMsNS41LTEyLjMsMTIuM3M1LjUsMTIuMywxMi4zLDEyLjNoNzkuOUwyMjIuOTUsMjQ5ICAgIEMyMTguMTUsMjUzLjgsMjE4LjE1LDI2MS41LDIyMi45NSwyNjYuM3oiIGZpbGw9IiMxMTU5OGMiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />;
const iconmin = <img style={{ width: "3em", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0wLDEyLjI1MXY0NjQuN2MwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMjI0YzYuOCwwLDEyLjMtNS41LDEyLjMtMTIuM3MtNS41LTEyLjMtMTIuMy0xMi4zSDI0LjV2LTQ0MC4yaDQ0MC4ydjIxMC41ICAgIGMwLDYuOCw1LjUsMTIuMiwxMi4zLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4ydi0yMjIuN2MwLTYuOC01LjUtMTIuMi0xMi4zLTEyLjJIMTIuM0M1LjUtMC4wNDksMCw1LjQ1MSwwLDEyLjI1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNNDc2LjksNDg5LjE1MWM2LjgsMCwxMi4zLTUuNSwxMi4zLTEyLjN2LTE3MC4zYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gzMDYuNmMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zdjE3MC40ICAgIGMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTcwLjNWNDg5LjE1MXogTTMxOC44LDMxOC43NTFoMTQ1Ljl2MTQ1LjlIMzE4LjhWMzE4Ljc1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMTM1LjksMjU3LjY1MWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTA5LjVjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zdi0xMDkuNWMwLTYuOC01LjUtMTIuMy0xMi4zLTEyLjMgICAgcy0xMi4zLDUuNS0xMi4zLDEyLjN2NzkuOWwtMTM4LjctMTM4LjdjLTQuOC00LjgtMTIuNS00LjgtMTcuMywwYy00LjgsNC44LTQuOCwxMi41LDAsMTcuM2wxMzguNywxMzguN2gtNzkuOSAgICBDMTQxLjQsMjQ1LjM1MSwxMzUuOSwyNTAuODUxLDEzNS45LDI1Ny42NTF6IiBmaWxsPSIjMTE1OThjIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />;
const logoamw = <img className="float-left" style={{ position: 'absolute', width: "6em" }} src={logo} />

// const API = new apicall()

class QueueView extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
      icon: iconexpand,
      isFull: false,
      fullstyle: {},
      dropdownOpen: false
    }

    this.select = {
      queryString: window.apipath + "/api/viw",
      t: "WorkQueue",
      q: "",
      f: "Destination,Status,ActualTime,StartTime,EndTime,Seq,IOType,StorageObject_Code,RefID,Priority,EventStatus,Pack_Name,Sou_Warehouse_Name,Des_Warehouse_Name," +
        "Sou_Area_Name,Des_Area_Name,Sou_AreaLocation_Name,Des_AreaLocation_Name,UserName,CreateTime,Document_Code",
      g: "",
      s: "[{'f':'Status','od':'ASC'},{'f':'ActualTime','od':'DESC'}]",
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
      f: "ID,ActualTime",
      g: "",
      s: "[{'f':'ActualTime','od':'DESC'}]",
      sk: 0,
      l: 1,
      all: "",
    }
    this.toggle = this.toggle.bind(this);
    this.GetQueueData = this.GetQueueData.bind(this)
    this.setTitle = this.setTitle.bind(this)
  }

  async componentWillMount() {
    const search = queryString.parse(this.props.location.search)
    this.setState({ locsearch: search.IOType, pathname: this.props.location.pathname })
  }

  setTitle() {
    if (this.state.pathname) {
      if (this.state.locsearch === "IN") {
        if (this.state.pathname === "/sys/gr/progress") {
          document.title = "Receiving Progress : AWMS";
          this.setState({ title: "Receiving Progress" })
        } else {
          document.title = "Receiving Progress : AWMS";
          this.setState({ title: "Receiving Progress" })
        }
      }
      if (this.state.locsearch === "OUT") {
        if (this.state.pathname === "/sys/gi/progress") {
          document.title = "Issuing Progress : AWMS";
          this.setState({ title: "Issuing Progress" })
        } else {
          document.title = "Issuing Progress : AWMS";
          this.setState({ title: "Issuing Progress" })
        }
      }
    }
  }

  componentDidMount() {
    this.setTitle()

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
        API.get(createQueryString(urlCheck) + "&apikey=FREE03").then(res => {
          if (res) {
            if (res.data.datas.length > 0) {
              console.log(res.data.datas[0].ActualTime)
              if (this.state.ActualTime !== res.data.datas[0].ActualTime) {
                this.GetQueueData(url)
              }
              this.setState({ ActualTime: res.data.datas[0].ActualTime });
            }
          }
        })
      }, 2000);
      this.setState({ interval: interval })
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.interval)
  }

  GetQueueData(url) {
    API.get(createQueryString(url) + "&apikey=FREE03").then(res => {
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
  goFull = () => {
    this.setState({ isFull: true });
  }
  goMin = () => {
    this.setState({ isFull: false });
  }
  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }
  render() {
    const cols = [
      // { accessor: "Row", Header: "No.", className: 'center', minWidth: 40 },
      {
        Header: "No.",
        id: "row",
        width: 90,
        filterable: false,
        className: 'center',
        Cell: (row) => {
          return <span style={{ fontWeight: 'bold' }}>{row.index + 1}</span>;
        }
      },
      {
        accessor: "ActualTime", Header: "Actual Time", className: 'center', width: 170, Cell: (e) =>
          this.datetimeBody(e.value, "date")
      },
      // { accessor: "IOType", Header: "IOType", minWidth: 50, className: 'center' },
      { accessor: "Priority", Header: "Priority", width: 130, className: 'center' },
      { accessor: "StorageObject_Code", Header: "Pallet", width: 170 },
      { accessor: "Pack_Name", Header: "Product" },
      { accessor: "Destination", Header: "Destination", width: 250 },
      { accessor: "Document_Code", Header: "Doc No.", width: 200 },
      { accessor: "RefID", Header: "SAP.Doc No.", width: 200 },
    ]

    return (
      <div>
        <div className="clearfix" style={{ paddingTop: '.2rem' }}>

        </div>
        <Fullscreen
          enabled={this.state.isFull}
          onChange={isFull => this.setState({ isFull })}
        >
          <div style={this.state.isFull ? { backgroundColor: '#e4e7ea', height: '100%', padding: '0em 0.5em 0.1em 0em' } : {}} className="fullscreen">
            <div className="clearfix" style={{ display: 'block', fontSize: '1.5em', height: 'auto', paddingBottom: '0.1em', marginBottom: '0.4em', backgroundColor: '#C8CED3' }}>
              <div className="float-right">
                <a style={this.state.locsearch === 'IN' ? { color: '#2f353a', cursor: 'pointer', fontSize: '1.3em', fontWeight: "bold", textDecoration: 'underline' } : { color: '#2f353a', cursor: 'pointer' }} onClick={() => { this.props.history.push('/Queue?IOType=IN'); window.location.reload(); }}>Receiving Progress</a>{' | '}
                <a style={this.state.locsearch === 'OUT' ? { color: '#2f353a', cursor: 'pointer', fontSize: '1.3em', fontWeight: "bold", textDecoration: 'underline' } : { color: '#2f353a', cursor: 'pointer' }} onClick={() => { this.props.history.push('/Queue?IOType=OUT'); window.location.reload(); }}>Issuing Progress</a>{' | '}
                <a style={{ color: '#2f353a', cursor: 'pointer' }} onClick={() => { this.props.history.push('/Dashboard') }}>Picking Progress</a>
              </div>
            </div>
            <div className="clearfix" style={{ paddingBottom: '.5rem' }}>
              <Row>
                <Col sm="1" xs="1" md="1" lg="1">{logoamw}</Col>
                <Col sm="9"><label className="float-left" style={{ paddingTop: ".5rem", fontSize: '2.25em', fontWeight: "bold" }}>Date <span style={{ fontWeight: "normal" }}>{moment().format('DD-MM-YYYY')}</span> Time: <span style={{ fontWeight: "normal" }}><Clock format="HH:mm:ss" ticking={true} interval={250} /></span></label></Col>
                <Col sm="2" xs="2" md="2" lg="2"><Button className="float-right" outline color="secondary" style={{ paddingBottom: "0.625em" }} onClick={this.state.isFull ? this.goMin : this.goFull}><span>{this.state.isFull ? iconmin : iconexpand}</span></Button></Col>
              </Row>
            </div>
            <ReactTable columns={cols} data={this.state.data} minRows={17} showPagination={false}
              style={{ background: 'white', marginBottom: '10px', fontSize: '2em', maxHeight: '33.55em', fontWeight: '800', paddingBottom: '5px' }} multiSort={false}
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

        </Fullscreen>
      </div>
    )
  }
}

export default QueueView;

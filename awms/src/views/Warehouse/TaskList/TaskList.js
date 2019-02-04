import React, { Component } from 'react';
import "react-table/react-table.css";
import { Badge, Input, Button, Row, Col, Card, CardImg, CardText, CardBody, CardLink, CardTitle, CardSubtitle } from 'reactstrap';
import ReactTable from 'react-table'
import { AutoSelect, Clone, apicall, createQueryString } from '../ComponentCore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import _ from 'lodash'
import '../componentstyle.css'
import Clock from 'react-live-clock';
import Fullscreen from "react-full-screen";
import moment from 'moment';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';
import Axios from 'axios';
import logo from '../../../assets/img/brand/Logo-AMW2.png'
const API = new apicall()

const iconexpand = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00NzYuOTUsMEgxMi4zNWMtNi44LDAtMTIuMiw1LjUtMTIuMiwxMi4yVjIzNWMwLDYuOCw1LjUsMTIuMiwxMi4yLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4yVjI0LjVoNDQwLjJ2NDQwLjJoLTIxMS45ICAgIGMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zczUuNSwxMi4zLDEyLjMsMTIuM2gyMjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjEyLjNDNDg5LjI1LDUuNSw0ODMuNzUsMCw0NzYuOTUsMHoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMC4wNSw0NzYuOWMwLDYuOCw1LjUsMTIuMywxMi4yLDEyLjNoMTcwLjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjMwNi42YzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gxMi4zNSAgICBjLTYuOCwwLTEyLjIsNS41LTEyLjIsMTIuM3YxNzAuM0gwLjA1eiBNMjQuNTUsMzE4LjhoMTQ1Ljl2MTQ1LjlIMjQuNTVWMzE4Ljh6IiBmaWxsPSIjMTE1OThjIi8+CgkJPHBhdGggZD0iTTIyMi45NSwyNjYuM2MyLjQsMi40LDUuNSwzLjYsOC43LDMuNnM2LjMtMS4yLDguNy0zLjZsMTM4LjYtMTM4Ljd2NzkuOWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNzMTIuMy01LjUsMTIuMy0xMi4zICAgIFY5OC4xYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM2gtMTA5LjVjLTYuOCwwLTEyLjMsNS41LTEyLjMsMTIuM3M1LjUsMTIuMywxMi4zLDEyLjNoNzkuOUwyMjIuOTUsMjQ5ICAgIEMyMTguMTUsMjUzLjgsMjE4LjE1LDI2MS41LDIyMi45NSwyNjYuM3oiIGZpbGw9IiMxMTU5OGMiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />;
const iconmin = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0wLDEyLjI1MXY0NjQuN2MwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMjI0YzYuOCwwLDEyLjMtNS41LDEyLjMtMTIuM3MtNS41LTEyLjMtMTIuMy0xMi4zSDI0LjV2LTQ0MC4yaDQ0MC4ydjIxMC41ICAgIGMwLDYuOCw1LjUsMTIuMiwxMi4zLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4ydi0yMjIuN2MwLTYuOC01LjUtMTIuMi0xMi4zLTEyLjJIMTIuM0M1LjUtMC4wNDksMCw1LjQ1MSwwLDEyLjI1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNNDc2LjksNDg5LjE1MWM2LjgsMCwxMi4zLTUuNSwxMi4zLTEyLjN2LTE3MC4zYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gzMDYuNmMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zdjE3MC40ICAgIGMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTcwLjNWNDg5LjE1MXogTTMxOC44LDMxOC43NTFoMTQ1Ljl2MTQ1LjlIMzE4LjhWMzE4Ljc1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMTM1LjksMjU3LjY1MWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTA5LjVjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zdi0xMDkuNWMwLTYuOC01LjUtMTIuMy0xMi4zLTEyLjMgICAgcy0xMi4zLDUuNS0xMi4zLDEyLjN2NzkuOWwtMTM4LjctMTM4LjdjLTQuOC00LjgtMTIuNS00LjgtMTcuMywwYy00LjgsNC44LTQuOCwxMi41LDAsMTcuM2wxMzguNywxMzguN2gtNzkuOSAgICBDMTQxLjQsMjQ1LjM1MSwxMzUuOSwyNTAuODUxLDEzNS45LDI1Ny42NTF6IiBmaWxsPSIjMTE1OThjIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />;
const logoamw = <img className="float-left" style={{ position: 'absolute', width: "4.25em" }} src={logo} />
class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icon: iconexpand,
      isFull: false,
      fullstyle: {},
      loadingWorkingOut: true,
      loadingTaskList: true,
      dataworkingout: [],
      datatasklist1: [],
      datatasklist: [],
      selectArea: [],
      WorkingOutselect: {
        queryString: window.apipath + "/api/viw",
        t: "r_DashboardMoveOut",
        // q: "[{ 'f': 'IOType', 'c': '=', 'v': 0 },{ 'f': 'AreaCode', 'c': '=', 'v': 'S' }]",
        q: "[{ 'f': 'IOType', 'c': '=', 'v': 1 },{ 'f': 'AreaID', 'c': 'in', 'v': '2,3' }]",
        f: "ID,Time,Document_Code,AreaID,AreaLoc_Code,Base_Code,Pack_Code,Pack_Name,Product,Destination,MVT,SAPRef,QtyUnit,EventStatus",
        g: "",
        s: "[{'f':'Status','od':'asc'},{'f':'IIF(Status = 1, Time, null)','od':'asc'},{'f':'IIF(Status = 3, Time, null)','od':'desc'}]",
        sk: 0,
        l: 20,
        all: "",
      },
      areaIDOnFloor: "8,9",

    }
    this.WorkQselect = {
      queryString: window.apipath + "/api/trx",
      t: "WorkQueue",
      q: '',
      q: "[{ 'f': 'IOType', 'c': '=', 'v': 1 }]",
      f: "ID",
      g: "",
      s: "[{'f':'ActualTime','od':'desc'}]",
      sk: 0,
      l: 1,
      all: "",
    }
    this.StoSelect = {
      queryString: window.apipath + "/api/trx",
      t: "StorageObject",
      q: '',
      q: "[{ 'f': 'AreaMaster_ID', 'c': 'in', 'v': '8,9' }]",
      f: "ID",
      g: "",
      s: "[{'f':'ModifyTime','od':'desc'}]",
      sk: 0,
      l: 1,
      all: "",
    }
    // this.timeout = null;
    this.updateQueueData = this.updateQueueData.bind(this)
    this.getDataTasklist = this.getDataTasklist.bind(this)
    this.getDataMoveOut = this.getDataMoveOut.bind(this)
  }
  //   ID	Code	Name
  // 3,8	Fด้านหน้า
  // 4,9	Rด้านหลัง
  async componentWillMount() {
    document.title = "Picking Progress : AWMS";
    //permission
    // let dataGetPer = await GetPermission()
    // CheckWebPermission("PickPro", dataGetPer, this.props.history);
  }
  componentDidMount() {
    this.getDataMoveOut()
    this.getDataTasklist()

    let interval1 = setInterval(() => {
      API.get(createQueryString(this.WorkQselect)).then(res => {
        if (res) {
          if (res.data.datas.length  > 0) {
            if (this.state.dataworkingout.length > 0) {
              console.log(this.state.dataworkingout[0].ID)
              if (this.state.queueID !== this.state.dataworkingout[0].ID) {
                this.getDataMoveOut()
              }
            }
            this.setState({ queueID: res.data.datas[0].ID }, () => console.log(this.state.queueID));
          }
        }
      })
    }, 2000);
    this.setState({ interval1: interval1 })

    let interval2 = setInterval(() => {
      API.get(createQueryString(this.StoSelect)).then(res => {
        if (res) {
          if (res.data.datas.length > 0) {
            if (this.state.datatasklist.length > 0) {
              console.log(this.state.datatasklist[0].ID)
              if (this.state.StoID !== this.state.datatasklist[0].ID) {
                this.getDataTasklist()
              }
            }
            this.setState({ StoID: res.data.datas[0].ID }, () => console.log(this.state.StoID));
          }
        }
      })
    }, 2000);
    this.setState({ interval2: interval2 })
  }
  componentWillUnmount() {
    clearInterval(this.state.interval1)
    clearInterval(this.state.interval2)
  }

  getDataMoveOut() {
    API.get(createQueryString(this.state.WorkingOutselect)).then((res) => {
      if (res) {
        this.setState({
          dataworkingout: res.data.datas, loadingWorkingOut: false
        })
      }
    })
  }
  getDataTasklist() {
    API.get(window.apipath + "/api/report/sp?apikey=FREE03&AreaIDs=" + this.state.areaIDOnFloor
      + "&spname=DASHBOARD_TASK_ON_FLOOR").then((res) => {
        if (res) {
          this.setState({
            datatasklist: res.data.datas, loadingTaskList: false
          })
        }
      })
  }
  goFull = () => {
    this.setState({ isFull: true });
  }
  goMin = () => {
    this.setState({ isFull: false });
  }
  updateQueueData(selValue) {
    var areaWorkingOut = this.state.WorkingOutselect;
    let taskwhere = '8,9';
    if (selValue !== undefined) {
      if (selValue !== "") {

        areaWorkingOut.q = "[{ 'f': 'IOType', c:'=', 'v': 1},{ 'f': 'AreaID', c:'in', 'v': '" + selValue + "'}]";
        if (selValue === '2') {
          taskwhere = '8'
        } else if (selValue === '3') {
          taskwhere = '9'
        }
      } else {
        areaWorkingOut.q = "[{ 'f': 'IOType', c:'=', 'v': 1},{ 'f': 'AreaID', c:'in', 'v': '2,3'}]";
        // taskwhere = '8,9';
      }
      // console.log(taskwhere)
      // console.log(areaWorkingOut)
    }
    this.setState({ WorkingOutselect: areaWorkingOut, areaIDOnFloor: taskwhere })

  }
  // this.getStatus(e.original.TaskName)
  // getStatus(value) {
  //   if (value.includes("/n")) {
  //     const data = value.split("/n");
  //     console.log(data)
  //     const items = data.map((value) => 
  //     <li><Badge color={value} style={{ fontSize: '0.875em', fontWeight: '500' }}>{value}</Badge></li>
  //     ); 
  //     return <ul>{items}</ul> 
  //   } else {
  //     return <Badge color={value} style={{ fontSize: '0.875em', fontWeight: '500' }}>{value}</Badge>
  //   }
  // }
  render() {
    const cols1 = [
      { accessor: "Time", Header: "Time", width: 80, className: 'center', Cell: (e) => e.original.Time ? moment(e.original.Time).format('HH:mm:ss') : "" },
      { accessor: "AreaLoc_Code", Header: "Gate", className: 'center', width: 100 },
      { accessor: "MVT", Header: "MVT.", width: 100, className: 'center' },
      { accessor: "Base_Code", Header: "Pallet", width: 100 },
      { accessor: "Product", Header: "Product" },
      { accessor: "QtyUnit", Header: "Qty", width: 130, className: 'right' },
      { accessor: "Destination", Header: "Destination", width: 200 },
      { accessor: "Document_Code", Header: "Doc No.", width: 105 },
      { accessor: "SAPRef", Header: "SAP.Doc No.", width: 110 },
    ]
    const cols2 = [
      { accessor: "Time", Header: "Time", width: 80, className: 'center', Cell: (e) => e.original.Time ? moment(e.original.Time).format('HH:mm:ss') : "" },
      {
        accessor: "TaskName", Header: "Task Name", width: 100, className: 'center',
        Cell: row => (
          <Badge color={row.value} style={{ fontSize: '0.825em', fontWeight: '500' }}>{row.value}</Badge>
        )
      },
      { accessor: "LocationCode", Header: "Stage", width: 100 },
      { accessor: "PalletCode", Header: "Pallet", width: 100 },
      { accessor: "Product", Header: "Product" },
      { accessor: "Qty", Header: "Qty", width: 130, className: 'right' },
      { accessor: "Destination", Header: "Destination", width: 200 },
      { accessor: "DocNo", Header: "Doc No.", width: 105 },
      { accessor: "SAPRef", Header: "SAP.Doc No.", width: 110 },
    ]
    const optionsArea = [
      { value: '', label: 'All Area' },
      { value: '2', label: 'Front Area' },
      { value: '3', label: 'Rear Area' }
    ];
    return (
      <div>
        <Fullscreen
          enabled={this.state.isFull}
          onChange={isFull => this.setState({ isFull })}
        >
          <div style={this.state.isFull ? { backgroundColor: '#e4e7ea', height: '100%', padding: '1.5625em' } : {}} className="fullscreen">
            <div id="full">
              <div className="clearfix" style={{ paddingBottom: '.5rem' }}>
                <Row>
                  <Col sm="1" xs="6" md="1" lg="1">{logoamw}</Col>
                  <Col sm="3" xs="6" md="4" lg="4"><label className="float-left" style={{ paddingTop: ".5rem", fontWeight: "bold" }}>Date <span style={{ fontWeight: "normal" }}>{moment().format('DD-MM-YYYY')}</span> Time: <span style={{ fontWeight: "normal" }}><Clock format="HH:mm:ss" ticking={true} interval={250} /></span></label></Col>
                  <Col sm="3" xs="3" md="2" lg="2"><label className="float-right" style={{ paddingTop: ".5rem", fontWeight: "bold" }}>Area: </label></Col>
                  <Col sm="4" xs="7" md="4" lg="4">{<AutoSelect className="float-right" data={optionsArea} result={(res) => {
                    this.updateQueueData(res.value)
                    {/*this.setState({ areavalue: e.value, areatext: e.label }, () => console.log(this.state.areavalue + " " + this.state.areatext))*/ }
                  }} />}</Col>
                  <Col sm="1" xs="2" md="1" lg="1"><Button className="float-right" outline color="secondary" style={{ paddingBottom: "0.625em" }} onClick={this.state.isFull ? this.goMin : this.goFull}><span>{this.state.isFull ? iconmin : iconexpand}</span></Button></Col>
                </Row>
              </div>


              <div id="Table1" className="styleTable">
                <p className="rightAlign" id="pbottom">Move Out</p>
                <div>
                  <ReactTable
                    columns={cols1}
                    minRows={7}
                    data={this.state.dataworkingout}
                    sortable={false}
                    style={{ background: 'white', fontSize: '1.125em', maxHeight: '20em', fontWeight: '450' }}
                    filterable={false}
                    showPagination={false}
                    NoDataComponent={() => null}
                    loading={this.state.loadingWorkingOut}
                    getTrProps={(state, rowInfo, column) => {
                      let result = false
                      let rmv = false
                      let classStatus = ""
                      if (rowInfo && rowInfo.row) {
                        result = true
                        if (rowInfo.original.EventStatus === 11 || rowInfo.original.EventStatus === 12) {
                          rmv = true
                          classStatus = "working"
                        } else if (rowInfo.original.EventStatus === 31 || rowInfo.original.EventStatus === 32) {
                          rmv = true
                          classStatus = "inqueue"
                        } else { rmv = false }
                      }
                      if (result && rmv)
                        return { className: classStatus }
                      else
                        return {}
                    }}
                  />
                </div>
              </div>

              <div id="Table2" className="Table2 styleTable">
                <p className="rightAlign" id="pbottom">Task List</p>
                <div style={{ overflowY: 'auto' }}>
                  <ReactTable
                    columns={cols2}
                    minRows={7}
                    data={this.state.datatasklist}
                    sortable={false}
                    style={{ background: 'white', fontSize: '1.125em', maxHeight: '20em', fontWeight: '450' }}
                    filterable={false}
                    showPagination={false}
                    NoDataComponent={() => null}
                    loading={this.state.loadingTaskList}
                  //defaultPageSize={15} 
                  />
                </div>
              </div>

            </div>
          </div>
        </Fullscreen>
      </div >
    )
  }

}

export default TaskList
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
const API = new apicall()

const iconexpand = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00NzYuOTUsMEgxMi4zNWMtNi44LDAtMTIuMiw1LjUtMTIuMiwxMi4yVjIzNWMwLDYuOCw1LjUsMTIuMiwxMi4yLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4yVjI0LjVoNDQwLjJ2NDQwLjJoLTIxMS45ICAgIGMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zczUuNSwxMi4zLDEyLjMsMTIuM2gyMjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjEyLjNDNDg5LjI1LDUuNSw0ODMuNzUsMCw0NzYuOTUsMHoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMC4wNSw0NzYuOWMwLDYuOCw1LjUsMTIuMywxMi4yLDEyLjNoMTcwLjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjMwNi42YzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gxMi4zNSAgICBjLTYuOCwwLTEyLjIsNS41LTEyLjIsMTIuM3YxNzAuM0gwLjA1eiBNMjQuNTUsMzE4LjhoMTQ1Ljl2MTQ1LjlIMjQuNTVWMzE4Ljh6IiBmaWxsPSIjMTE1OThjIi8+CgkJPHBhdGggZD0iTTIyMi45NSwyNjYuM2MyLjQsMi40LDUuNSwzLjYsOC43LDMuNnM2LjMtMS4yLDguNy0zLjZsMTM4LjYtMTM4Ljd2NzkuOWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNzMTIuMy01LjUsMTIuMy0xMi4zICAgIFY5OC4xYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM2gtMTA5LjVjLTYuOCwwLTEyLjMsNS41LTEyLjMsMTIuM3M1LjUsMTIuMywxMi4zLDEyLjNoNzkuOUwyMjIuOTUsMjQ5ICAgIEMyMTguMTUsMjUzLjgsMjE4LjE1LDI2MS41LDIyMi45NSwyNjYuM3oiIGZpbGw9IiMxMTU5OGMiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />;
const iconmin = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0wLDEyLjI1MXY0NjQuN2MwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMjI0YzYuOCwwLDEyLjMtNS41LDEyLjMtMTIuM3MtNS41LTEyLjMtMTIuMy0xMi4zSDI0LjV2LTQ0MC4yaDQ0MC4ydjIxMC41ICAgIGMwLDYuOCw1LjUsMTIuMiwxMi4zLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4ydi0yMjIuN2MwLTYuOC01LjUtMTIuMi0xMi4zLTEyLjJIMTIuM0M1LjUtMC4wNDksMCw1LjQ1MSwwLDEyLjI1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNNDc2LjksNDg5LjE1MWM2LjgsMCwxMi4zLTUuNSwxMi4zLTEyLjN2LTE3MC4zYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gzMDYuNmMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zdjE3MC40ICAgIGMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTcwLjNWNDg5LjE1MXogTTMxOC44LDMxOC43NTFoMTQ1Ljl2MTQ1LjlIMzE4LjhWMzE4Ljc1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMTM1LjksMjU3LjY1MWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTA5LjVjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zdi0xMDkuNWMwLTYuOC01LjUtMTIuMy0xMi4zLTEyLjMgICAgcy0xMi4zLDUuNS0xMi4zLDEyLjN2NzkuOWwtMTM4LjctMTM4LjdjLTQuOC00LjgtMTIuNS00LjgtMTcuMywwYy00LjgsNC44LTQuOCwxMi41LDAsMTcuM2wxMzguNywxMzguN2gtNzkuOSAgICBDMTQxLjQsMjQ1LjM1MSwxMzUuOSwyNTAuODUxLDEzNS45LDI1Ny42NTF6IiBmaWxsPSIjMTE1OThjIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />;

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
        f: "Time,Document_Code,AreaID,AreaLoc_Code,Base_Code,Pack_Code,Pack_Name,Product,Destination,SAPRef,QtyUnit,EventStatus",
        g: "",
        s: "[{'f':'Status','od':'asc'},{'f':'Time','od':'asc'}]",
        sk: 0,
        l: 10,
        all: "",
      },
      TaskListselect: {
        queryString: window.apipath + "/api/viw",
        t: "r_DashboardTaskOnFloor",
        //q: "",
        q: "[{ 'f': 'DocumentType_ID', 'c': 'in', 'v': '1002,2004' }]",
        f: "Time,TaskName,Document_Code,AreaID,AreaLoc_Code,Base_Code,Pack_Code,Pack_Name,Product,Destination,SAPRef,QtyUnit,DocumentType_ID,EventStatus",
        g: "",
        s: "[{'f':'Time','od':'asc'}]",
        sk: 0,
        l: 10,
        all: "",
      } 
    }
    this.timeout = null;
    this.updateQueueData = this.updateQueueData.bind(this)
    this.GetListData = this.GetListData.bind(this)
  }
  //   ID	Code	Name
  // 3,8	Fด้านหน้า
  // 4,9	Rด้านหลัง
  async componentWillMount() {
    document.title = "Picking Progress : AWMS";
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("PickPro", dataGetPer, this.props.history);
  }
  componentDidMount() {
    this._mounted = true;
    this.GetListData()
  }
  componentWillUnmount() {
    this._mounted = false;
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  GetListData() {
    if (this._mounted) {
      // console.log("loaddata")
      API.all([API.get(createQueryString(this.state.WorkingOutselect)),
      API.get(createQueryString(this.state.TaskListselect))]).then((res) => {
        this.setState({
          dataworkingout: res[0].data.datas, loadingWorkingOut: false,
          datatasklist: res[1].data.datas, loadingTaskList: false
        })
      }).then(() => {
        this.timeout = setTimeout(this.GetListData, 3000);
      })
    }
  }

  goFull = () => {
    this.setState({ isFull: true });
  }
  goMin = () => {
    this.setState({ isFull: false });
  }
  updateQueueData(selValue) {
    var areaWorkingOut = this.state.WorkingOutselect;
    var areaTaskList = this.state.TaskListselect;
    let areawhere = [];
    let taskwhere = [];
    if (selValue !== undefined) {
      if (selValue !== "") {
        // console.log(selValue)
        areawhere.push({ 'f': 'AreaCode', 'c': '=', 'v': selValue }, { 'f': 'IOType', 'c': '=', 'v': 1 });
        taskwhere.push({ 'f': 'AreaCode', 'c': '=', 'v': selValue === 'F' ? 'FS' : selValue === 'R' ? 'RS' : '' }, { 'f': 'DocumentType_ID', 'c': 'in', 'v': '1002,2004' });
        areaWorkingOut.q = JSON.stringify(areawhere)
        areaTaskList.q = JSON.stringify(taskwhere)
      } else {
        areawhere.push({ 'f': 'IOType', 'c': '=', 'v': 1 },{ 'f': 'AreaID', 'c': 'in', 'v': '2,3' });
        // areawhere.push({ 'f': 'AreaCode', 'c': '=', 'v': 'S' },{ 'f': 'IOType', 'c': '=', 'v': 0 });
        taskwhere.push({ 'f': 'AreaID', 'c': 'in', 'v': '8,9' }, { 'f': 'DocumentType_ID', 'c': 'in', 'v': '1002,2004' });
        areaWorkingOut.q = JSON.stringify(areawhere)
        areaTaskList.q = JSON.stringify(taskwhere)
      }
    }
    this.setState({ WorkingOutselect: areaWorkingOut, TaskListselect: areaTaskList })
  }
  render() {
    const cols1 = [
      { accessor: "Time", Header: "Time", minWidth: 80, className: 'center', Cell: (e) => e.original.Time ? moment(e.original.Time).format('HH:mm:ss') : "" },
      { accessor: "AreaLoc_Code", Header: "Gate", minWidth: 50 },
      { accessor: "Base_Code", Header: "Pallet", minWidth: 100 },
      { accessor: "Product", Header: "Product", minWidth: 300 },
      { accessor: "QtyUnit", Header: "Qty", minWidth: 120 },
      { accessor: "Destination", Header: "Destination", minWidth: 150 },
      { accessor: "Document_Code", Header: "Doc No.", minWidth: 90 },
      { accessor: "SAPRef", Header: "SAP Ref.", minWidth: 100 },
    ]
    const cols2 = [
      { accessor: "Time", Header: "Time", minWidth: 80, className: 'center', Cell: (e) => e.original.Time ? moment(e.original.Time).format('HH:mm:ss') : "" },
      {
        accessor: "TaskName", Header: "Task Name", minWidth: 70, className: 'center',
        Cell: row => (
          <Badge color={row.value} style={{ fontSize: '1rem', fontWeight: '600' }}>{row.value}</Badge>
        )
      },
      { accessor: "AreaLoc_Code", Header: "Stage", minWidth: 60 },
      { accessor: "Base_Code", Header: "Pallet", minWidth: 100 },
      { accessor: "Product", Header: "Product", minWidth: 250 },
      { accessor: "QtyUnit", Header: "Qty", minWidth: 120 },
      { accessor: "Destination", Header: "Destination", minWidth: 150 },
      { accessor: "Document_Code", Header: "Doc No.", minWidth: 90 },
      { accessor: "SAPRef", Header: "SAP Ref.", minWidth: 100 },
    ]
    const optionsArea = [
      { value: '', label: 'All Area' },
      { value: 'F', label: 'Front Area' },
      { value: 'R', label: 'Rear Area' }
    ];
    return (
      <div>
        <Fullscreen
          enabled={this.state.isFull}
          onChange={isFull => this.setState({ isFull })}
        >
          <div style={this.state.isFull ? { backgroundColor: '#e4e7ea', padding: '1.5625em', maxHeight: 'auto' } : {}} className="fullscreen">
            <div className="clearfix" style={{ paddingBottom: '.5rem' }}>
              <Row>
                <Col sm="3" xs="12" md="4" lg="4"><label className="float-left" style={{ paddingTop: ".5rem", fontWeight: "bold" }}>Date <span style={{ fontWeight: "normal" }}>{moment().format('DD-MM-YYYY')}</span> Time: <span style={{ fontWeight: "normal" }}><Clock format="HH:mm:ss" ticking={true} interval={1000} /></span></label></Col>
                <Col sm="3" xs="3" md="2" lg="3"><label className="float-right" style={{ paddingTop: ".5rem", fontWeight: "bold" }}>Area: </label></Col>
                <Col sm="5" xs="7" md="5" lg="4">{<AutoSelect className="float-right" data={optionsArea} result={(res) => {
                  this.updateQueueData(res.value)
                  {/*this.setState({ areavalue: e.value, areatext: e.label }, () => console.log(this.state.areavalue + " " + this.state.areatext))*/ }
                }} />}</Col>
                <Col sm="1" xs="2" md="1" lg="1"><Button className="float-right" outline color="secondary" style={{ paddingBottom: "0.625em" }} onClick={this.state.isFull ? this.goMin : this.goFull}><span>{this.state.isFull ? iconmin : iconexpand}</span></Button></Col>
              </Row>
            </div>

            <Row>
              <Col>
                <Card body outline color="info">
                  <CardTitle>Move Out</CardTitle>
                  <ReactTable
                    columns={cols1}
                    minRows={5}
                    data={this.state.dataworkingout}
                    sortable={false}
                    style={{ background: 'white', height: '12em', fontSize: '1rem', fontWeight: '400' }}
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
                          classStatus = "inqueue"
                        } else if (rowInfo.original.EventStatus === 31 || rowInfo.original.EventStatus === 32) {
                          rmv = true
                          classStatus = "success"
                        } else { rmv = false }
                      }
                      if (result && rmv)
                        return { className: classStatus }
                      else
                        return {}
                    }}
                  />
                </Card>
              </Col>
            </Row>
            <Row>
              <Col>
                <Card body outline color="primary">
                  <CardTitle>Task List</CardTitle>
                  <ReactTable
                    columns={cols2}
                    minRows={10}
                    data={this.state.datatasklist}
                    sortable={false}
                    style={{ background: 'white', height: '12em', fontSize: '1rem', fontWeight: '400' }}
                    filterable={false}
                    showPagination={false}
                    NoDataComponent={() => null}
                    loading={this.state.loadingTaskList}
                  //defaultPageSize={15} 
                  />
                </Card>
              </Col>
            </Row >
          </div>
        </Fullscreen>
      </div >
    )
  }

}

export default TaskList

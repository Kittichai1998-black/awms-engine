import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Button, Row, Col, Card, CardImg, CardText, CardBody, CardLink, CardTitle, CardSubtitle } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone, apicall,createQueryString} from '../ComponentCore' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' 
import _ from 'lodash'
import '../componentstyle.css'
import {GetPermission,Nodisplay} from '../../ComponentCore/Permission';
import Clock from 'react-live-clock';
import Fullscreen from "react-full-screen";
import moment from 'moment';

const API = new apicall()

const iconexpand = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00NzYuOTUsMEgxMi4zNWMtNi44LDAtMTIuMiw1LjUtMTIuMiwxMi4yVjIzNWMwLDYuOCw1LjUsMTIuMiwxMi4yLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4yVjI0LjVoNDQwLjJ2NDQwLjJoLTIxMS45ICAgIGMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zczUuNSwxMi4zLDEyLjMsMTIuM2gyMjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjEyLjNDNDg5LjI1LDUuNSw0ODMuNzUsMCw0NzYuOTUsMHoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMC4wNSw0NzYuOWMwLDYuOCw1LjUsMTIuMywxMi4yLDEyLjNoMTcwLjRjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zVjMwNi42YzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gxMi4zNSAgICBjLTYuOCwwLTEyLjIsNS41LTEyLjIsMTIuM3YxNzAuM0gwLjA1eiBNMjQuNTUsMzE4LjhoMTQ1Ljl2MTQ1LjlIMjQuNTVWMzE4Ljh6IiBmaWxsPSIjMTE1OThjIi8+CgkJPHBhdGggZD0iTTIyMi45NSwyNjYuM2MyLjQsMi40LDUuNSwzLjYsOC43LDMuNnM2LjMtMS4yLDguNy0zLjZsMTM4LjYtMTM4Ljd2NzkuOWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNzMTIuMy01LjUsMTIuMy0xMi4zICAgIFY5OC4xYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM2gtMTA5LjVjLTYuOCwwLTEyLjMsNS41LTEyLjMsMTIuM3M1LjUsMTIuMywxMi4zLDEyLjNoNzkuOUwyMjIuOTUsMjQ5ICAgIEMyMTguMTUsMjUzLjgsMjE4LjE1LDI2MS41LDIyMi45NSwyNjYuM3oiIGZpbGw9IiMxMTU5OGMiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />;
const iconmin = <img style={{ width: "auto", height: "auto" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4OS4zIDQ4OS4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuMyA0ODkuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0wLDEyLjI1MXY0NjQuN2MwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMjI0YzYuOCwwLDEyLjMtNS41LDEyLjMtMTIuM3MtNS41LTEyLjMtMTIuMy0xMi4zSDI0LjV2LTQ0MC4yaDQ0MC4ydjIxMC41ICAgIGMwLDYuOCw1LjUsMTIuMiwxMi4zLDEyLjJzMTIuMy01LjUsMTIuMy0xMi4ydi0yMjIuN2MwLTYuOC01LjUtMTIuMi0xMi4zLTEyLjJIMTIuM0M1LjUtMC4wNDksMCw1LjQ1MSwwLDEyLjI1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNNDc2LjksNDg5LjE1MWM2LjgsMCwxMi4zLTUuNSwxMi4zLTEyLjN2LTE3MC4zYzAtNi44LTUuNS0xMi4zLTEyLjMtMTIuM0gzMDYuNmMtNi44LDAtMTIuMyw1LjUtMTIuMywxMi4zdjE3MC40ICAgIGMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTcwLjNWNDg5LjE1MXogTTMxOC44LDMxOC43NTFoMTQ1Ljl2MTQ1LjlIMzE4LjhWMzE4Ljc1MXoiIGZpbGw9IiMxMTU5OGMiLz4KCQk8cGF0aCBkPSJNMTM1LjksMjU3LjY1MWMwLDYuOCw1LjUsMTIuMywxMi4zLDEyLjNoMTA5LjVjNi44LDAsMTIuMy01LjUsMTIuMy0xMi4zdi0xMDkuNWMwLTYuOC01LjUtMTIuMy0xMi4zLTEyLjMgICAgcy0xMi4zLDUuNS0xMi4zLDEyLjN2NzkuOWwtMTM4LjctMTM4LjdjLTQuOC00LjgtMTIuNS00LjgtMTcuMywwYy00LjgsNC44LTQuOCwxMi41LDAsMTcuM2wxMzguNywxMzguN2gtNzkuOSAgICBDMTQxLjQsMjQ1LjM1MSwxMzUuOSwyNTAuODUxLDEzNS45LDI1Ny42NTF6IiBmaWxsPSIjMTE1OThjIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />;

class TaskList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      icon: iconexpand,
      isFull: false,
      fullstyle: {},
      loading: true,
      dataworkingout: [],
      datatasklist: [],
      selectArea: [],
      WorkingOutselect: {
        queryString: window.apipath + "/api/viw",
        t: "WorkingOut",
        q: "[{ 'f': 'SouAreaID', 'c': 'in', 'v': '2,3' }]",
        f: "Time,Gate,SouAreaID,Pallet,Product,MoveTo,EventStatus,WorkStatus",
        g: "",
        s: "[{'f':'WorkStatus','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      data1: [{ Time: "John", Gate: "G25", Pallet: "001001007", Product: "ถุงพลาสติก1", MoveTo: null, WorkStatus: 1},
        { Time: "Anna", Gate: "G22", Pallet: "001001006", Product: "ถุงพลาสติก2", MoveTo: null, WorkStatus: 2 },
        { Time: "Frank", Gate: "G23", Pallet: "001001009", Product: "ถุงพลาสติก3", MoveTo: null, WorkStatus: 3},
        { Time: "Estur", Gate: "G24", Pallet: "001001008", Product: "ถุงพลาสติก4", MoveTo: null, WorkStatus: 4 },
        { Time: "Estur", Gate: "G24", Pallet: "001001008", Product: "ถุงพลาสติก4", MoveTo: null, WorkStatus: 5 }],
      data2: [{ Document: "Code1 : xxxx", TaskName: "cccccc", Location: "ccccccccc", "Product": "ถุงพลาสติก1", Amount: "10/100", WorkStatus: 1 },
        { Document: "Code1 : xxxx", TaskName: "cccccc", Location: "ccccccccc", "Product": "ถุงพลาสติก1", Amount: "20/100", WorkStatus: 2},
        { Document: "Code1 : xxxx", TaskName: "cccccc", Location: "ccccccccc", "Product": "ถุงพลาสติก1", Amount: "30/100", WorkStatus: 3 },
        { Document: "Code1 : xxxx", TaskName: "cccccc", Location: "ccccccccc", "Product": "ถุงพลาสติก1", Amount: "40/100", WorkStatus: 4 }]
    }
     
    this.GetQueueData = this.GetQueueData.bind(this)
    this.updateQueueData = this.updateQueueData.bind(this)
  }

  componentDidMount() {
    this.GetQueueData()
    let interval = setInterval(this.GetQueueData, 2000);
    this.setState({ interval: interval })
  }
  componentWillUnmount() {
    clearInterval(this.state.interval)
  }
  GetQueueData() {
    API.get(createQueryString(this.state.WorkingOutselect)).then(res => {
      this.setState({ dataworkingout: res.data.datas, loading: false }, () => console.log("load work"));
    })
    API.get(createQueryString(this.state.WorkingOutselect)).then(res => {
      this.setState({ datatasklist: this.state.data2, loading: false }, () => console.log("load task"));
    })
  }
  goFull = () => {
    this.setState({ isFull: true });
  }
  goMin = () => {
    this.setState({ isFull: false });
  }
  updateQueueData(selValue) {
    const areaWorkingOut = this.state.WorkingOutselect;
    let areawhere = [];
    if (selValue !== undefined) {
      if (selValue !== "") {
        console.log(selValue)
        areawhere.push({ 'f': 'SouAreaID', 'c': '=', 'v': selValue });
        areaWorkingOut.q = JSON.stringify(areawhere)
      } else {
        areawhere.push({ 'f': 'SouAreaID', 'c': 'in', 'v': '2,3' });
        areaWorkingOut.q = JSON.stringify(areawhere)
      }  
    } 
    API.get(createQueryString(this.state.WorkingOutselect)).then(res => {
      this.setState({ dataworkingout: res.data.datas, loading: false }, () => console.log("load working out filter"));
    })
    API.get(createQueryString(this.state.WorkingOutselect)).then(res => {
      this.setState({ datatasklist: res.data.datas, loading: false }, () => console.log("load task filter"));
    })
  }
  render() {
    const cols1 = [
      { accessor: "Time", Header: "Time", minWidth: 60 },
      { accessor: "Gate", Header: "Gate", minWidth: 70 },
      { accessor: "Pallet", Header: "Pallet", minWidth: 80 },
      { accessor: "Product", Header: "Product", minWidth: 150},
      { accessor: "MoveTo", Header: "Move To", minWidth: 120 },
    ]
    const cols2 = [
      { accessor: "Document", Header: "Document" },
      { accessor: "TaskName", Header: "Task Name" },
      { accessor: "Location", Header: "Location" },
      { accessor: "Product", Header: "Product" },
      { accessor: "Amount", Header: "Amount" },
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
          <div style={this.state.isFull ? {backgroundColor: '#e4e7ea', padding: '1.5625em'} : {}} className="fullscreen">
        <div className="clearfix" style={{ paddingBottom: '.5rem' }}>
          <Row>
                <Col sm="3" xs="12" md="4" lg="4"><label className="float-left" style={{ paddingTop: ".5rem", fontWeight: "bold" }}>Date <span style={{ fontWeight: "normal" }}>{moment().format('DD-MM-YYYY')}</span> Time: <span style={{ fontWeight: "normal" }}><Clock format="HH:mm:ss" ticking={true} interval={1000} /></span></label></Col>
                <Col sm="3" xs="3" md="2" lg="3"><label className="float-right" style={{ paddingTop: ".5rem", fontWeight: "bold" }}>Area: </label></Col>
                <Col sm="5" xs="7" md="5" lg="4">{<AutoSelect className="float-right" data={optionsArea} result={(res) => {
                  this.updateQueueData(res.value)
                  {/*this.setState({ areavalue: e.value, areatext: e.label }, () => console.log(this.state.areavalue + " " + this.state.areatext))*/ }
                }}/>}</Col>
                <Col sm="1" xs="2" md="1" lg="1"><Button className="float-right" outline color="secondary" style={{ paddingBottom: "0.625em" }} onClick={this.state.isFull ? this.goMin : this.goFull}><span>{this.state.isFull ? iconmin : iconexpand}</span></Button></Col>
          </Row>
      </div>
         
        <Row>
          <Col xs="12" sm="12" md="12" lg="6">
        <Card body outline color="info">
              <CardTitle>Moving Out</CardTitle>
                  <ReactTable
                    columns={cols1}
                    minRows={15}
                    data={this.state.dataworkingout}
                    sortable={false}
                    style={{ background: 'white', textAlign: 'center' }}
                    filterable={false}
                    showPagination={false}
                    NoDataComponent={() => null}
                    loading={this.state.loading}
                    defaultPageSize={15}
                    getTrProps={(state, rowInfo, column) => {
                      let result = false
                      let rmv = false
                      let classStatus = ""
                      if (rowInfo && rowInfo.row) {
                        result = true
                        if (rowInfo.original.WorkStatus === 1) {
                          rmv = true
                          classStatus = "inqueue"
                        } else if (rowInfo.original.WorkStatus === 2) {
                          rmv = true
                          classStatus = "working"
                        } else if (rowInfo.original.WorkStatus === 3) {
                          rmv = true
                          classStatus = "success"
                        } else if (rowInfo.original.WorkStatus === 4) {
                          rmv = true
                          classStatus = "error"
                        } else if (rowInfo.original.WorkStatus === 5) {
                          rmv = true
                          classStatus = "cancel"
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
          <Col xs="12" sm="12" md="12" lg="6">
        <Card body outline color="primary">
              <CardTitle>Task List</CardTitle>
                  <ReactTable
                    columns={cols2}
                    minRows={15}
                    data={this.state.datatasklist}
                    sortable={false}
                    style={{ background: 'white' }}
                    filterable={false}
                    showPagination={false}
                    NoDataComponent={() => null}
                    loading={this.state.loading}
                    defaultPageSize={15}
                    getTrProps={(state, rowInfo, column) => {
                      let result = false
                      let rmv = false
                      let classStatus = ""
                      if (rowInfo && rowInfo.row) {
                        result = true
                        if (rowInfo.original.WorkStatus === 1) {
                          rmv = true
                          classStatus = "inqueue"
                        } else if (rowInfo.original.WorkStatus === 2) {
                          rmv = true
                          classStatus = "working"
                        } else if (rowInfo.original.WorkStatus === 3) {
                          rmv = true
                          classStatus = "success"
                        } else if (rowInfo.original.WorkStatus === 4) {
                          rmv = true
                          classStatus = "error"
                        } else if (rowInfo.original.WorkStatus === 5) {
                          rmv = true
                          classStatus = "cancel"
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
    </Row >
          </div>
        </Fullscreen>
      </div >
    )
  }

}

export default TaskList

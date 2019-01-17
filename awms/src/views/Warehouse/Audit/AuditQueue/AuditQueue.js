import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Nav, NavItem, NavLink, Row,Col, Card, CardBody } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone, apicall,createQueryString} from '../../ComponentCore';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()

class AuditQueue extends Component{
  constructor(){
    super();
    this.state = {
      palletComponent:false,
      issuedComponent:false,
      palletEdit:false,
      toggle:false,
      pickMode:1,
      pickItemList:[]
    }
    this.createDocItemList = this.createDocItemList.bind(this)
    this.onHandleSelectionDoc = this.onHandleSelectionDoc.bind(this)
    this.style = {width:"100%", overflow:"hidden", marginBottom: "10px", textAlign:"left"}
    this.select =  {
      queryString: window.apipath + "/api/viw",
      t: "Document",
      q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 2004},{ 'f': 'EventStatus', c:'=', 'v': 11},{ 'f': 'Status', c:'=', 'v': 1}]",
      f: "ID,Code",
      g: "",
      s: "[{'f':'ID','od':'desc'}]",
      sk: 0,
      l: 0,
      all: "",
    };
    this.station = [{label:"Front",value:0},
    {label:"Back",value:1}];
    this.priority = [{ 'value': 0, 'label': 'Low' },
    { 'value': 1, 'label': 'Normal' },
    { 'value': 2, 'label': 'High' },
    { 'value': 3, 'label': 'Critical' }];
  }

  async componentWillMount() {
    document.title = "Queue Audit : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    //this.displayButtonByPermission(dataGetPer)
    CheckWebPermission("QueueAd", dataGetPer, this.props.history);
  }

  componentDidMount(){
    Axios.get(window.apipath + createQueryString(this.select)).then(res => {
      var docList = [];
      docList.forEach(x => {
        docList.push({label:x.Code, value:x.ID})
      });
      this.setState({docSelection:docList})
    });
  }

  onHandleSelectionDoc(docID){
    Axios.get(window.apipath + "/api/wm/audit/doc?getMapSto=false&docID="+ docID).then(res => {
      this.setState({document:res.data.document});
    })
  }

  createDocItemList(){
    return this.state.document.documentItems.map(x => {
      return <Card>
        <CardBody>
          <div>Item : {x.Code}</div>
          <div>Batch : {x.Batch}</div>
          <div>SAP Document : {x.RefID}</div>
          <div>Unit : {x.UnitType_Code}</div>
        </CardBody>
      </Card>
    })
  }

  onHandleCreateAuditQueue(){
    let data = {
      docID:this.state.document.ID,
      warehouseID:1,
      palletCode:"",
      locationCode:"",
      priority:"",
      desAreaID:this.state.desAreaID

    }

    Axios.post(window.apipath + "/api/wm/audit/create").then(res => {

    });
  }

  render(){
    return(
      <div>
        <Row>
          {<AutoSelect data={this.state.docSelection} result={e => this.setState({docSelected:e.value})}/>}
        </Row>
        <Row>
          {this.createDocItemList()}
        </Row>
        <Row>
          <span>Area : </span>{<AutoSelect data={this.station} result={e => this.setState({desAreaID:e.value})}/>}
          <span>Priority : </span>{<AutoSelect data={this.priority} result={e => this.setState({priority:e.value})}/>}
        </Row>
      </div>
    )
  }
}

export default AuditQueue;

import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Nav, NavItem, NavLink, Row,Col, Card, CardBody } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, apicall,createQueryString} from '../../ComponentCore';
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
      pickItemList:[],
      document:null,
      docSelection:[],
      queueList:[],
      percent:100,
      queueProcess:false
    }
    this.createDocItemList = this.createDocItemList.bind(this);
    this.onHandleSelectionDoc = this.onHandleSelectionDoc.bind(this);
    this.onHandleCreateAuditQueue = this.onHandleCreateAuditQueue.bind(this);
    this.onHandleGetAuditQueue = this.onHandleGetAuditQueue.bind(this);

    this.style = {width:"100%", overflow:"hidden", marginBottom: "10px", textAlign:"left"}
    this.select =  {
      queryString: window.apipath + "/api/viw",
      t: "Document",
      q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 2004},{ 'f': 'EventStatus', c:'=', 'v': 10}]",//,{ 'f': 'Status', c:'=', 'v': 1}
      f: "ID,Code",
      g: "",
      s: "[{'f':'ID','od':'desc'}]",
      sk: 0,
      l: 0,
      all: "",
    };
    this.station = [{'label':"Front",'value':8},{'label':"Back",'value':9}];
    this.priority = [{ 'value': 0, 'label': 'Low' },
    { 'value': 1, 'label': 'Normal' },
    { 'value': 2, 'label': 'High' },
    { 'value': 3, 'label': 'Critical' }];
    this.auditType = [{'label':"Percentage",'value':0},{'label':"Pallet",'value':1}];
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
    Axios.get(createQueryString(this.select)).then(res => {
      var docList = [];
      res.data.datas.forEach(x => {
        docList.push({label:x.Code, value:x.ID})
      });
      this.setState({docSelection:docList})
    });
  }

  onHandleSelectionDoc(docID){
    Axios.get(window.apipath + "/api/wm/audit/doc?getMapSto=false&docID="+ docID).then(res => {
      this.setState({document:res.data.document, docID});
    })
  }

  createDocItemList(){
    return this.state.document.documentItems.map(x => {
      return <Card style={{width:"100%", padding:'5px', margin:'5px 0'}}>
        <CardBody>
          <div>Item : {x.code}</div>
          <div>Unit : {x.unitType_Code}</div>
          <div>Batch : {x.batch}</div>
          {x.refID === null ? null : <div>SAP Document : {x.refID}</div>}
          {x.locationCode !== undefined ? <div>Location : {x.locationCode}</div> : x.palletCode !== undefined ? <div>Pallet Code : {x.palletCode}</div> : null}
        </CardBody>
      </Card>
    })
  }

  onHandleCreateAuditQueue(){
    let data = {
      docID:this.state.docID,
      workQueue:this.state.workQueue,
      disto:this.state.disto,
    }

    Axios.post(window.apipath + "/api/wm/audit/create", data).then(res => {
      if(res.data._result.status === 1)
      {
        this.setState({itemList:res.data.listItems})
      }
    });
  }

  onHandleGetAuditQueue(){
    Axios.get(window.apipath + "/api/wm/audit/get?docID="+ this.state.docID + "&warehouseID=1&priority=" + 
      this.state.priority + "&desAreaID=" + this.state.desAreaID + "&percent=" + this.state.percent +
      "&auditType=" + this.state.auditType).then(res => {
        if(res.data._result.status === 1)
        {
          var docID = res.data.docID;
          var queueList = res.data.workQueue.map(x=> {
            return {
              palletCode:x.storageObject_Code
            }
          });

          var queueTable = <ReactTable style={{width:"100%"}} data={queueList} editable={false} filterable={false} defaultPageSize={2000}
          editable={false} minRows={5} showPagination={false}
          columns={[{ accessor: 'palletCode', Header: 'Pallet Code'}]}/>

          this.setState({queueTable, docID, workQueue: res.data.workQueue, disto: res.data.disto, queueProcess:true})
      }
    });
  }

  render(){
    return(
      <div>
        <Row>
          <Col sm="6">
            <Card style={{padding:"30px", minHeight:"500px"}}>
              <Row>
                <Col sm="2" style={{paddingRight:0}}><span>Document : </span></Col>
                <Col sm="10">
                  <AutoSelect selectfirst={false} data={this.state.docSelection} result={e => {this.onHandleSelectionDoc(e.value)}}/>
                </Col>
              </Row>
              <Row>
                {this.state.document === null ? null :this.createDocItemList()}
              </Row>
              <Row>
                <Col sm="2"><span>Area : </span></Col><Col sm="10"><AutoSelect data={this.station} result={e => this.setState({desAreaID:e.value})}/></Col>
                <Col sm="2"><span>Priority : </span></Col><Col sm="10"><AutoSelect data={this.priority} result={e => this.setState({priority:e.value})}/></Col>
                <Col sm="2">Audit : </Col><Col sm="4"><Input style={{width:"150px"}} type="number" value={this.state.percent} onChange={(e) => this.setState({percent:e.target.value})}/></Col><Col sm="6"><AutoSelect data={this.auditType} result={e => this.setState({auditType:e.value})}/></Col>
                {this.state.document === null ? null : <Button style={{ background: "#d50000", color: "white", width: "150px",marginTop:'20px' }} onClick={this.onHandleGetAuditQueue}>Process Queue</Button>}
              </Row>
            </Card>
          </Col>
          <Col sm="6">
            {this.state.queueProcess === false ? null : <Card style={{padding:"30px"}}>
              <Row>
                {this.state.queueTable}
              </Row>
              <Row>
                {this.state.document === null ? null : <Button style={{ background: "#d50000", color: "white", width: "150px",marginTop:'20px' }} onClick={this.onHandleCreateAuditQueue}>Create Queue</Button>}</Row>
            </Card>}
            </Col>
        </Row>
      </div>
    )
  }
}

export default AuditQueue;

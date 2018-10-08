import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../../MasterData/TableSetup';
import Axios from 'axios';

class IssuedDoc extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
        'status' : [{'value':'1','label':'Working'},{'value':'2','label':'Reject'},{'value':'3','label':'Complete'},{'value':'*','label':'All'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1001},{'f':'Status','c':'!=','v':2}]",
      f:"ID,Code,SouBranch,Status,SouWarehouse,SouArea,DesCustomer,ForCustomer,Batch,Lot,ActionTime,DocumentDate,EventStatus,RefID,CreateBy,ModifyBy",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:10,
      all:"",},
      sortstatus:0,
      selectiondata:[]
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.createQueryString = this.createQueryString.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this)
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount(){
  }

  createQueryString = (select) => {
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

  getSelectionData(data){
    this.setState({selectiondata:data})
  }

  workingData(data,status){
    let postdata = {docIDs:[]}
    if(data.length > 0){
      data.forEach(rowdata => {
        postdata["docIDs"].push(rowdata.ID)
      })
      if(status==="accept"){
        Axios.post(window.apipath + "/api/wm/issued/doc/working", postdata).then((res) => this.setState({resp:res.data._result.message}))
      }
      else{
        Axios.post(window.apipath + "/api/wm/issued/doc/rejected", postdata).then((res) => this.setState({resp:res.data._result.message}))
      }
    }
  }

  onClickToDesc(data){
    console.log(this)
    return <Button type="button" color="info" onClick={() => this.history.push('/wms/issueddoc/manage/issuedmanage?ID='+data.ID)}>Detail</Button>
  }

  render(){
    const cols = [
      {accessor: 'Code', Header: 'Code',editable:false, Filter:"text"},
      {accessor: 'SouBranch', Header: 'Branch',editable:false, Filter:"text"},
      {accessor: 'SouWarehouse', Header: 'Warehouse', editable:false, Filter:"text",},
      {accessor: 'SouArea', Header: 'Area', editable:false, Filter:"text",},
      {accessor: 'DesCustomer', Header: 'Customer', editable:false, Filter:"text",},
      {accessor: 'ForCustomer', Header: 'For Customer', editable:false, Filter:"text",},
      {accessor: 'Batch', Header: 'Batch', editable:false, Filter:"text",},
      {accessor: 'Lot', Header: 'Lot', editable:false, Filter:"text",},
      {accessor: 'Status', Header: 'status', editable:false, Filter:"text", Type:"DocumentStatus"},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"text", Type:"EventStatus"},
      {accessor: 'ActionTime', Header: 'Action Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:false},
      {accessor: 'RefID', Header: 'RefID', editable:false,},
      {accessor: 'Created', Header: 'CreateBy', editable:false, filterable:false},
      {accessor: 'Modified', Header: 'ModifyBy', editable:false, filterable:false},
      /* {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Link"}, */
    ];

    const btnfunc = [{
      history:this.props.history,
      btntype:"Link",
      func:this.onClickToDesc
    }]
    

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        {/* <div className="clearfix">
          <Button className="float-right">{<Link style={{ color: '#FFF', textDecorationLine :'none' }} to={'/wms/issueddoc/manage/issuedmanage'}>Create Document</Link>}</Button>
        </div> */}
        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
        statuslist = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        btn={btnfunc} defaultCondition={[{ 'f': 'DocumentType_ID', c:'=', 'v': 1001},{'f':'Status','c':'!=','v':2}]}
        accept={false}/>
        {/* <Card>
          <CardBody>
            <Button onClick={() => this.workingData(this.state.selectiondata,"accept")} color="primary"className="mr-sm-1">Working</Button>
            <Button onClick={() => this.workingData(this.state.selectiondata,"reject")} color="danger"className="mr-sm-1">Reject</Button>
          </CardBody>
        </Card> */}
      </div>
    )
  }
}

export default IssuedDoc;

import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody,Button} from 'reactstrap';
import { TableGen } from '../../MasterData/TableSetup';
//import Axios from 'axios';
import {apicall, DatePicker, GenerateDropDownStatus,createQueryString} from '../../ComponentCore'
import moment from 'moment';
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';
import Axios from 'axios';


const axois = new apicall()

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
        'status' : GenerateDropDownStatus("DocumentStatus"),
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      },{
        'status' : GenerateDropDownStatus("DocumentEventStatus"),
        'header' : 'EventStatus',
        'field' : 'EventStatus',
        'mode' : 'check',
      }],
      acceptstatus: false,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "LinkDocument",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': '1001'}]",
        f: "*",
        g: "",
        s: "[{'f':'Code','od':'desc'}]",
        sk: 0,
        l: 10,
        all: "",
      },
      sortstatus: 0,
      selectiondata: []
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }

  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data =await GetPermission()
    Nodisplay(data,21,this.props.history)
    this.displayButtonByPermission(data)
    //permission

    // Axios.get(createQueryString(this.state.select)).then((res) => {
    //   res.data.datas.forEach(row1 =>{
    //     console.log(row1)
    //     this.setState({Batch:row1.Batch})

    //   })
      
    //})

  }

//permission
displayButtonByPermission(perID){

  this.setState({perID:perID})
  let check = false
 for(let i = 0;i < perID.length; i++){
   let data = perID[i]
   if(data === 20){
      check = false
      break
    }if(data === 21){
      check = true
    }
 }
       if(check === true){  
          var PerButtonExport = document.getElementById("per_button_export")
          PerButtonExport.remove()     
          var PerButtonDate = document.getElementById("per_button_date")
          PerButtonDate.remove()    
       }else if(check === false){
          this.setState({showbutton:"block"})
       }
  }
  //permission

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }


  onClickToDesc(data) {
    return <Button style={{color:"white"}} type="button" color="info" onClick={() => this.history.push('/doc/gr/view?docID=' + data.ID)}>Detail</Button>
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
      if(status === "reject"){
        axois.post(window.apipath + "/api/wm/received/doc/rejected", postdata).then((res) => {this.setState({resp:res.data._result.message})})
      } else {
        axois.post(window.apipath + "/api/wm/received/doc/close", postdata).then((res) => {this.setState({resp:res.data._result.message})})

      }
    }
  }

  render() 
  {
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
      {accessor: 'Super', Header: 'LinkDocument', editable:false, Filter:"text",},
      {accessor: 'Code', Header: 'Code', editable:false, Filter:"text", Cell: (e) => <span>{e.original.DocumentType_ID === 1101 ?e.original.CodeDocItem:e.original.Code}</span>},
      //{accessor: 'CodeDocItem', Header: 'CodeDocItem', editable:false, Filter:"text",},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:""},
      {accessor: 'SouWarehouseName', Header: 'DestinationWarehouse', editable:false, Filter:"text",},
      {accessor: 'SouBranchName', Header: 'SourceBranch', editable:false, Filter:"text",},
      {accessor: 'DesWarehouseName', Header: 'SourceWarehouse', editable:false, Filter:"text",},
      {accessor: 'DesBranchName', Header: 'DestinationBranc', editable:false, Filter:"text",},
      {accessor: 'RefID', Header: 'MaterialDocNo', editable:false, Filter:"text",},
      {accessor: 'Ref1', Header: 'MaterialDocYears', editable:false, Filter:"text",},
      {accessor: 'Ref2', Header: 'MovementType', editable:false, Filter:"text",},
      //{accessor: 'Link', Header: 'Link', editable:false, Filter:"text",},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"dropdown", Type:"DocumentEvent"},
      {accessor: 'Created', Header: 'Created', editable:false, filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Link"},
    ];

    const btnfunc = [{
      history: this.props.history,
      btntype: "Link",
      func: this.onClickToDesc
    }]

    return (
      <div>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <div className="clearfix" style={{display:this.state.showbutton}} >
          <Button style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px',display:this.state.showbutton }}color="primary" className="float-right" onClick={() => this.props.history.push('/doc/gr/manage')}>Create Document</Button>
        </div>

        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
        dropdownfilter = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        btn={btnfunc} defaultPageSize={100000} defaultCondition={[{ 'f': 'DocumentType_ID', c:'=', 'v': 1001}]}
        accept={false} sapBtn={true}/>

        <Card>
          <CardBody>
            <Button id="per_button_reject" style={{ background: "primary", borderColor: "primary", width: '130px', display:this.state.showbutton }} 
              onClick={() => this.workingData(this.state.selectiondata, "reject")} color="primary" className="float-right">Reject</Button>
            <Button id="per_button_reject" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px', display:this.state.showbutton }} 
              onClick={() => this.workingData(this.state.selectiondata, "Close")} color="danger" className="float-right">Close</Button>
            {this.state.resp}
          </CardBody>
        </Card>    
      </div>
    )
  }
}

export default IssuedDoc;

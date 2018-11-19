import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
//import Axios from 'axios';
import {apicall, GenerateDropDownStatus} from '../ComponentCore'
import {GetPermission,Nodisplay} from '../../ComponentCore/Permission';
import LoadPDF from './LoadPDF';
import * as jsPDF from 'jspdf';
import moment from 'moment';
import _ from 'lodash';
import html2canvas from 'html2canvas';
const Axios =  new apicall() 

const iconpdf = <img style={{width: "17px", height: "inherit"}} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2IDU2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NiA1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPHBhdGggc3R5bGU9ImZpbGw6I0U5RTlFMDsiIGQ9Ik0zNi45ODUsMEg3Ljk2M0M3LjE1NSwwLDYuNSwwLjY1NSw2LjUsMS45MjZWNTVjMCwwLjM0NSwwLjY1NSwxLDEuNDYzLDFoNDAuMDc0ICAgYzAuODA4LDAsMS40NjMtMC42NTUsMS40NjMtMVYxMi45NzhjMC0wLjY5Ni0wLjA5My0wLjkyLTAuMjU3LTEuMDg1TDM3LjYwNywwLjI1N0MzNy40NDIsMC4wOTMsMzcuMjE4LDAsMzYuOTg1LDB6Ii8+Cgk8cG9seWdvbiBzdHlsZT0iZmlsbDojRDlEN0NBOyIgcG9pbnRzPSIzNy41LDAuMTUxIDM3LjUsMTIgNDkuMzQ5LDEyICAiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDQzRCNEM7IiBkPSJNMTkuNTE0LDMzLjMyNEwxOS41MTQsMzMuMzI0Yy0wLjM0OCwwLTAuNjgyLTAuMTEzLTAuOTY3LTAuMzI2ICAgYy0xLjA0MS0wLjc4MS0xLjE4MS0xLjY1LTEuMTE1LTIuMjQyYzAuMTgyLTEuNjI4LDIuMTk1LTMuMzMyLDUuOTg1LTUuMDY4YzEuNTA0LTMuMjk2LDIuOTM1LTcuMzU3LDMuNzg4LTEwLjc1ICAgYy0wLjk5OC0yLjE3Mi0xLjk2OC00Ljk5LTEuMjYxLTYuNjQzYzAuMjQ4LTAuNTc5LDAuNTU3LTEuMDIzLDEuMTM0LTEuMjE1YzAuMjI4LTAuMDc2LDAuODA0LTAuMTcyLDEuMDE2LTAuMTcyICAgYzAuNTA0LDAsMC45NDcsMC42NDksMS4yNjEsMS4wNDljMC4yOTUsMC4zNzYsMC45NjQsMS4xNzMtMC4zNzMsNi44MDJjMS4zNDgsMi43ODQsMy4yNTgsNS42Miw1LjA4OCw3LjU2MiAgIGMxLjMxMS0wLjIzNywyLjQzOS0wLjM1OCwzLjM1OC0wLjM1OGMxLjU2NiwwLDIuNTE1LDAuMzY1LDIuOTAyLDEuMTE3YzAuMzIsMC42MjIsMC4xODksMS4zNDktMC4zOSwyLjE2ICAgYy0wLjU1NywwLjc3OS0xLjMyNSwxLjE5MS0yLjIyLDEuMTkxYy0xLjIxNiwwLTIuNjMyLTAuNzY4LTQuMjExLTIuMjg1Yy0yLjgzNywwLjU5My02LjE1LDEuNjUxLTguODI4LDIuODIyICAgYy0wLjgzNiwxLjc3NC0xLjYzNywzLjIwMy0yLjM4Myw0LjI1MUMyMS4yNzMsMzIuNjU0LDIwLjM4OSwzMy4zMjQsMTkuNTE0LDMzLjMyNHogTTIyLjE3NiwyOC4xOTggICBjLTIuMTM3LDEuMjAxLTMuMDA4LDIuMTg4LTMuMDcxLDIuNzQ0Yy0wLjAxLDAuMDkyLTAuMDM3LDAuMzM0LDAuNDMxLDAuNjkyQzE5LjY4NSwzMS41ODcsMjAuNTU1LDMxLjE5LDIyLjE3NiwyOC4xOTh6ICAgIE0zNS44MTMsMjMuNzU2YzAuODE1LDAuNjI3LDEuMDE0LDAuOTQ0LDEuNTQ3LDAuOTQ0YzAuMjM0LDAsMC45MDEtMC4wMSwxLjIxLTAuNDQxYzAuMTQ5LTAuMjA5LDAuMjA3LTAuMzQzLDAuMjMtMC40MTUgICBjLTAuMTIzLTAuMDY1LTAuMjg2LTAuMTk3LTEuMTc1LTAuMTk3QzM3LjEyLDIzLjY0OCwzNi40ODUsMjMuNjcsMzUuODEzLDIzLjc1NnogTTI4LjM0MywxNy4xNzQgICBjLTAuNzE1LDIuNDc0LTEuNjU5LDUuMTQ1LTIuNjc0LDcuNTY0YzIuMDktMC44MTEsNC4zNjItMS41MTksNi40OTYtMi4wMkMzMC44MTUsMjEuMTUsMjkuNDY2LDE5LjE5MiwyOC4zNDMsMTcuMTc0eiAgICBNMjcuNzM2LDguNzEyYy0wLjA5OCwwLjAzMy0xLjMzLDEuNzU3LDAuMDk2LDMuMjE2QzI4Ljc4MSw5LjgxMywyNy43NzksOC42OTgsMjcuNzM2LDguNzEyeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NDNEI0QzsiIGQ9Ik00OC4wMzcsNTZINy45NjNDNy4xNTUsNTYsNi41LDU1LjM0NSw2LjUsNTQuNTM3VjM5aDQzdjE1LjUzN0M0OS41LDU1LjM0NSw0OC44NDUsNTYsNDguMDM3LDU2eiIvPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0xNy4zODUsNTNoLTEuNjQxVjQyLjkyNGgyLjg5OGMwLjQyOCwwLDAuODUyLDAuMDY4LDEuMjcxLDAuMjA1ICAgIGMwLjQxOSwwLjEzNywwLjc5NSwwLjM0MiwxLjEyOCwwLjYxNWMwLjMzMywwLjI3MywwLjYwMiwwLjYwNCwwLjgwNywwLjk5MXMwLjMwOCwwLjgyMiwwLjMwOCwxLjMwNiAgICBjMCwwLjUxMS0wLjA4NywwLjk3My0wLjI2LDEuMzg4Yy0wLjE3MywwLjQxNS0wLjQxNSwwLjc2NC0wLjcyNSwxLjA0NmMtMC4zMSwwLjI4Mi0wLjY4NCwwLjUwMS0xLjEyMSwwLjY1NiAgICBzLTAuOTIxLDAuMjMyLTEuNDQ5LDAuMjMyaC0xLjIxN1Y1M3ogTTE3LjM4NSw0NC4xNjh2My45OTJoMS41MDRjMC4yLDAsMC4zOTgtMC4wMzQsMC41OTUtMC4xMDMgICAgYzAuMTk2LTAuMDY4LDAuMzc2LTAuMTgsMC41NC0wLjMzNWMwLjE2NC0wLjE1NSwwLjI5Ni0wLjM3MSwwLjM5Ni0wLjY0OWMwLjEtMC4yNzgsMC4xNS0wLjYyMiwwLjE1LTEuMDMyICAgIGMwLTAuMTY0LTAuMDIzLTAuMzU0LTAuMDY4LTAuNTY3Yy0wLjA0Ni0wLjIxNC0wLjEzOS0wLjQxOS0wLjI4LTAuNjE1Yy0wLjE0Mi0wLjE5Ni0wLjM0LTAuMzYtMC41OTUtMC40OTIgICAgYy0wLjI1NS0wLjEzMi0wLjU5My0wLjE5OC0xLjAxMi0wLjE5OEgxNy4zODV6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zMi4yMTksNDcuNjgyYzAsMC44MjktMC4wODksMS41MzgtMC4yNjcsMi4xMjZzLTAuNDAzLDEuMDgtMC42NzcsMS40NzdzLTAuNTgxLDAuNzA5LTAuOTIzLDAuOTM3ICAgIHMtMC42NzIsMC4zOTgtMC45OTEsMC41MTNjLTAuMzE5LDAuMTE0LTAuNjExLDAuMTg3LTAuODc1LDAuMjE5QzI4LjIyMiw1Mi45ODQsMjguMDI2LDUzLDI3Ljg5OCw1M2gtMy44MTRWNDIuOTI0aDMuMDM1ICAgIGMwLjg0OCwwLDEuNTkzLDAuMTM1LDIuMjM1LDAuNDAzczEuMTc2LDAuNjI3LDEuNiwxLjA3M3MwLjc0LDAuOTU1LDAuOTUsMS41MjRDMzIuMTE0LDQ2LjQ5NCwzMi4yMTksNDcuMDgsMzIuMjE5LDQ3LjY4MnogICAgIE0yNy4zNTIsNTEuNzk3YzEuMTEyLDAsMS45MTQtMC4zNTUsMi40MDYtMS4wNjZzMC43MzgtMS43NDEsMC43MzgtMy4wOWMwLTAuNDE5LTAuMDUtMC44MzQtMC4xNS0xLjI0NCAgICBjLTAuMTAxLTAuNDEtMC4yOTQtMC43ODEtMC41ODEtMS4xMTRzLTAuNjc3LTAuNjAyLTEuMTY5LTAuODA3cy0xLjEzLTAuMzA4LTEuOTE0LTAuMzA4aC0wLjk1N3Y3LjYyOUgyNy4zNTJ6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zNi4yNjYsNDQuMTY4djMuMTcyaDQuMjExdjEuMTIxaC00LjIxMVY1M2gtMS42NjhWNDIuOTI0SDQwLjl2MS4yNDRIMzYuMjY2eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />;

class LoadingManage extends Component{
  constructor() {
    super();
    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
        'status' : GenerateDropDownStatus("Status"),
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      },{
        'status' : GenerateDropDownStatus("DocumentEventStatus"),
        'header' : 'EventStatus',
        'field' : 'EventStatus',
        'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/viw",
      t:"Loading",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1012}]",
      f:"ID,Code,CustomerName,DocumentType_ID,Transport_ID,ActionTime,DocumentDate,EventStatus,Status,CreateTime,ModifyTime,Remark,IssuedCode,LinkDocument_ID",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:20,
      all:"",},
      sortstatus:0,
      selectiondata: [],
      isVisibility: false,
      datashow: [],
      datasitems: []
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.callPDF = this.callPDF.bind(this)
    this.htmlToPDF = this.htmlToPDF.bind(this)
    this.genData = this.genData.bind(this);

    this.select={queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",}
  }

  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data = await GetPermission()
    Nodisplay(data,31,this.props.history)
    this.displayButtonByPermission(data)
    //permission
  }
  //permission
displayButtonByPermission(perID){
  this.setState({perID:perID})
  let check = false
  perID.forEach(row => {
      if(row === 31){
        check = true
      }else if(row === 32){
        check = false
      }
    })
       if(check === true){  
          var PerButtonReject = document.getElementById("per_button_Reject")
          PerButtonReject.remove()     
          var PerButtoWorking = document.getElementById("per_button_Working")
          PerButtoWorking.remove()    
          var PerButtonCrete = document.getElementById("per_button_create")
          PerButtonCrete.remove() 
 
       }else if(check === false){
          this.setState({showbutton:"block"})
       }else{
          this.props.history.push("/404")
       } 
  }
  //permission

  workingData(data,status){
    let postdata = []
    if(data.length > 0){
      data.forEach(rowdata => {
        postdata.push(rowdata.ID)
      })
      if(status==="accept"){
        Axios.post(window.apipath + "/api/wm/loading/doc/working", {docIDs:postdata}).then((res) => {this.setState({resp:res.data._result.message})})
      }
      else{
        Axios.post(window.apipath + "/api/wm/loading/doc/reject", {docIDs:postdata}).then((res) => {this.setState({resp:res.data._result.message})})
      }
    }
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data){
    this.setState({selectiondata:data})
  }
 
  callPDF(cID) {
    console.log("ID: " + cID); 
    let documents = [];
    let dataitems = [];
    Axios.get(window.apipath + "/api/wm/loading/doc/?getMapSto=true&docID=" + cID).then(rowselect1 => {
      if (rowselect1.data._result.status === 0) {
        documents = [];
      }
      else {
        documents = rowselect1.data;
      }
      Axios.get(window.apipath + "/api/wm/loading/conso?docID=" + cID).then(res => {
        dataitems = res.data;
      }).then(() => {
        //console.log(documents); console.log(dataitems);
        this.setState({
          //data: documents.document.documentItems,
          customer: documents.document.desCustomerName,
          CodeDoc: documents.document.code,
          ActionDate: moment(documents.document.actionTime).format("DD/MM/YYYY"),
          ActionTime: moment(documents.document.actionTime).format("HH:mm"),
          datasitems: dataitems
        }, () => {
          this.genData()
        })
      });
    })
  }
 
  genData() {
    let dataitems = this.state.datasitems.datas;
    var groupdisplay = [];
    var packName = [];
    let groupdata = _.groupBy(dataitems, (e) => { return e.code });
    console.log(groupdata);
    var no = parseInt(0);
    for (let i in groupdata) {
      var packName = "";
      var packQty = parseInt(0);
      groupdata[i].forEach((group, index) => {
        packName += group.packName;
        if (groupdata[i].length > index + 1)
          packName += ", ";
        packQty += group.packQty;
      })
      groupdisplay.push({
        "id": no += 1,
        "code": i,
        "item": packName,
        "qty": packQty
      });
    }
    this.setState({ datashow: groupdisplay }, () => {
      this.setState({
        showpdf: <LoadPDF
          customer={this.state.customer}
          actionDate={this.state.ActionDate}
          actionTime={this.state.ActionTime}
          codeDoc={this.state.CodeDoc}
          groupdisplay={this.state.datashow}
        />
      }, () => this.setState({ isVisibility: !this.state.isVisibility }, () => this.htmlToPDF()) )
      
    });
  }

  htmlToPDF() {
    var datalength = this.state.datashow.length;
    if (datalength <= 10) {
      //มีข้อมูล 1-10แถว ไม่ต้องเพิ่มหน้า
      const input = document.getElementById('myPDF');
      html2canvas(input, { dpi: 300 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'pt', 'a4');
          pdf.setFontSize(12);
          pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          pdf.addImage(imgData, 'JPEG', 28, 40);
          pdf.save(this.state.CodeDoc + ".pdf");
        }).then(() => this.setState({ isVisibility: false }));
    } else {
      //มีข้อมูลมากกว่า 10-28 แถว ยก footer ไปหน้าใหม่
      // const input = document.getElementById('myPDF');
      const allfooter = document.getElementById('allfooter');
      const detail = document.getElementById('detail');
      const pdf = new jsPDF('p', 'pt', 'a4');
      pdf.setFontSize(12);
      pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
      html2canvas(detail, { dpi: 300 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'JPEG', 28, 40);
          pdf.addPage();
          pdf.setFontSize(12);
          pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          html2canvas(allfooter, { dpi: 300 })
            .then((canvas2) => {
              const imgData2 = canvas2.toDataURL('image/png');
              pdf.addImage(imgData2, 'JPEG', 28, 70);
              pdf.save(this.state.CodeDoc + ".pdf");
            }).then(() => this.setState({ isVisibility: false }));
        });
    }

  }
  render() {
    
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
      {accessor: 'Code', Header: 'Loading Code',editable:false, Filter:"text"},
      {accessor: 'IssuedCode', Header: 'Issued Code',editable:false, Filter:"text"},
      {accessor: 'CustomerName', Header: 'Customer Name',editable:false, Filter:"text"},
      {accessor: 'ActionTime', Header: 'Action Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:false},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"dropdown", Type:"DocumentEvent"},
      {accessor: 'CreateTime', Header: 'CreateBy', editable:false,Type:"datetime", filterable:false},
      {accessor: 'ModifyTime', Header: 'ModifyBy', editable:false,Type:"datetime", filterable:false},
      { accessor: 'Remark', Header: 'Remark', editable: false, filterable: false },
      {editable: false, filterable: false,  Cell:(e) => {
        return <Button color="primary" style={{ background: "#26c6da", borderColor: "#26c6da" }}
          onClick={() => { this.props.history.push('/doc/ld/manage?ID='+ e.original.ID)
        }
          }>Detail</Button>}},
      {
        editable: false, filterable: false, Cell: (e) => {
          return <Button outline color="danger" onClick={() => {
            this.callPDF(e.original.ID)
          }}>{iconpdf} PDF</Button> 
          
        }
      }
    ];
    
    return(
      <div>
        {this.state.isVisibility ? this.state.showpdf : null }

      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <div className="clearfix" id="per_button_create" style={{display:this.state.showbutton}}>
          <Button style={{ background: "#66bb6a", borderColor: "#66bb6a" }} color="primary" className="float-right" onClick={() => this.props.history.push('/doc/ld/manage')}>Create Document</Button>
        </div>
        <TableGen column={cols} data={this.state.select} filterable={true}
        dropdownfilter = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        accept={false} defalutCondition={[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'=', 'v': 1},{ 'f': 'eventStatus', c:'=', 'v': 11}]}/>
        <Card >
          <CardBody >
            <Button style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px'}}
              onClick={() => this.workingData(this.state.selectiondata, "accept")} color="primary" id="per_button_Working" style={{display:this.state.showbutton}} className="float-right" >Working</Button>
            <Button style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }}
              onClick={() => this.workingData(this.state.selectiondata, "reject")} color="danger" id="per_button_Reject" style={{display:this.state.showbutton}} className="float-right">Reject</Button>
            {this.state.resp}
          </CardBody>
        </Card>

      </div>
    )
  }
}

export default LoadingManage;

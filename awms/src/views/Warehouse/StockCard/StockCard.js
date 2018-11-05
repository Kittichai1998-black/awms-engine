import React, { Component } from 'react';
import "react-table/react-table.css";
import {  Button, Row, Col } from 'reactstrap';
import ReactTable from 'react-table';
//import Axios from 'axios';
import { apicall,AutoSelect, DatePicker } from '../ComponentCore';
//import DatePicker from 'react-datepicker';
import moment from 'moment';

const createQueryString = (select) => {
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
const Axios = new apicall()


class StockCard extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data1:[],
      data:[],
      PackMaster:{queryString:window.apipath + "/api/viw",
      t:"PackMaster",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"concat(Code,' : ',Name) as PackName , Code",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",},
      Document:{queryString:window.apipath + "/api/trx",
      t:"Document",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"*",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",},
      PackMasterdata:[],
      selectdata:{queryString:window.apipath + "/api/viw",
      t:"StockCard",
      q:'[{ "f": "Status", "c":"=", "v": 4}]',
      f:"*",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",},
      PackMasterdata:[],
    
    }
    this.onCalculate = this.onCalculate.bind(this)
  }
  componentDidMount(){
       Axios.get(createQueryString(this.state.PackMaster)).then((response) => {
         const PackMasterdata = []
         response.data.datas.forEach(row => {
          var PackData= row.PackName
          PackMasterdata.push({label:PackData,value:row.Code})
          
         })
           this.setState({PackMasterdata})    
         })
       }

  dateTimePickerFrom(){
    return <DatePicker onChange={(e) => {this.setState({dateFrom:e})}} dateFormat="DD/MM/YYYY"/>
  }
  dateTimePickerTo(){
    return <DatePicker onChange={(e) => {this.setState({dateTo:e})}} dateFormat="DD/MM/YYYY"/>
  }

  onGetDocument(){
    if(this.state.dateFrom===undefined ||this.state.dateTo === undefined || this.state.CodePack === undefined ) {
      alert("Please select data")
    } else {
    let formatDateFrom = this.state.dateFrom.format("YYYY-MM-DD")
    let formatDateTo = this.state.dateTo.format("YYYY-MM-DD")
    
      if (formatDateFrom > formatDateTo ){
        alert("Choose the wrong information")
      } else {

        let QueryDoc = this.state.selectdata
        let JSONDoc = []
        JSONDoc.push({"f": "DocumentDate", "c":"<=", "v":formatDateTo},
          {"f": "Code", "c":"=", "v":this.state.CodePack},{"f": "Status", "c":"=", "v":"3"})
        QueryDoc.q = JSON.stringify(JSONDoc)
            Axios.get(createQueryString(QueryDoc)).then((res) => { 
            this.setState({data:res.data.datas},()=>{
            //console.log(this.state.data)
            if(this.state.data.length > 0){
              let dateDoc = this.state.data.filter(row=>{
              return row.DocumentDate >= formatDateFrom
              })
              let dateThrow = this.state.data.filter(row2=>{
              return row2.DocumentDate <= formatDateFrom           
              })
              let sum = 0
              var arrdata =[]
                dateThrow.forEach(row=>{
                  sum+= row.Quantity         
                })
            arrdata.push({DocumentType_ID:'Bring Forward',Total:sum})

            let sumDebit =0
            let sumCredit=0
            dateDoc.forEach(row=>{
              if(row.DocumentType_ID===1001){
                sum=row.Quantity+sum              
                arrdata.push({DocumentType_ID:row.Name,DocumentDate:row.DocumentDate,DocCode:row.DocCode,Debit:row.Quantity,Total:sum})
                sumDebit+=row.Quantity
              } else if (row.DocumentType_ID===1002){
                sum = Math.abs(row.Quantity-sum)
                arrdata.push({DocumentType_ID:row.Name,DocumentDate:row.DocumentDate,DocCode:row.DocCode,Credit:Math.abs(row.Quantity),Total:sum})
                sumCredit+=row.Quantity
              } else {
                if (row.Quantity>=0){              
                  sum=row.Quantity+sum
                  arrdata.push({DocumentType_ID:row.Name,DocumentDate:row.DocumentDate,DocCode:row.DocCode,Debit:row.Quantity,Total:sum})
                  sumDebit+=row.Quantity
                } else {
                  sum=row.Quantity+(sum)
                  arrdata.push({DocumentType_ID:row.Name,DocumentDate:row.DocumentDate,DocCode:row.DocCode,Credit:Math.abs(row.Quantity),Total:sum})
                  sumCredit+=(row.Quantity*(-1))
                }
              }
            })
            arrdata.push({Total:sum,Debit:sumDebit,Credit:sumCredit,DocumentDate:'Total'})
            this.setState({data1:arrdata},()=>{console.log(this.state.data1)})

          }else{
            this.setState({data1:[]})
          }
          })       
        })
      }
    }
  }

  onCalculate(){

    
  }

  render(){
    const cols = [
      {accessor: 'DocumentDate', Header: 'Date',editable:false,Cell: (e) => {
        let dataDate = moment(e.value).format("DD-MM-YYYY")
        return <span>{dataDate}</span>
      }},
      {accessor: 'DocCode', Header: 'Document',editable:false,},
      {accessor: 'DocumentType_ID', Header: 'Title',editable:false,},
      {accessor: 'Debit', Header: 'Debit', editable:false,},
      {accessor: 'Credit', Header: 'Credit', editable:false,},
      {accessor: 'Total', Header: 'Total', editable:false},
    ];
    return(
      <div>
        <div>
        <Row>
          <Col xs="6">
          <div>
            <label style={{marginRight:"10px"}} >SKU : </label>{' '}
              <div style={{display:"inline-block",width:"300px"}}>
                <AutoSelect data={this.state.PackMasterdata} result={e=>this.setState({CodePack:e.value}) }/>             
               </div>
          </div>
          </Col>
          <Col  xs="6"> 
            <div style={{textAlign:"right"}}>
              <label style={{width:"50px",marginRight:"10px"}}>Date : </label>
                <div style={{display:"inline-block"}}>
                  {this.state.pageID ? <span>{this.state.dateFrom.format("DD-MM-YYYY")}</span> : this.dateTimePickerFrom()}
                </div>
                <label style={{width:"50px",textAlign:"center"}}>To</label>
                <div style={{display:"inline-block"}}>
                  {this.state.pageID ? <span>{this.state.dateTo.format("DD-MM-YYYY")}</span> : this.dateTimePickerTo()}
                </div>{' '}
                <Button color="primary" id="off" onClick={() => {this.onGetDocument()}}>OK</Button>
            </div>          
          </Col>
        </Row>
        </div>
         <br></br>
        <ReactTable pageSize="10000" NoDataComponent={()=><div style={{textAlign:"center",height:"100px",color:"rgb(200,206,211)"}}>No row found</div>} sortable={false} style={{background:"white",marginBottom:"50px"}} filterable={false} showPagination={false} minRows={2} columns={cols} data={this.state.data1} />
      </div>



    )
  }
}
export default StockCard;

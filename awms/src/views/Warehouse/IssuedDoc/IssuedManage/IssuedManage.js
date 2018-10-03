import React, { Component } from 'react';
import {Link,Redirect}from 'react-router-dom';
import "react-table/react-table.css";
import {Input, Card, CardBody, Button, Row} from 'reactstrap';
import ReactTable from 'react-table'
import Axios from 'axios';
import ReactAutocomplete from 'react-autocomplete';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import EventStatus from '../../EventStatus'
import queryString from 'query-string'
import {AutoSelect} from '../../ComponentCore'
import 'react-datepicker/dist/react-datepicker.css';

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

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

class IssuedManage extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      branch:[],
      auto_branch:[],
      auto_warehouse:[],
      auto_customer:[],
      branch:"",
      customer:"",
      warehouse:"",
      documentStatus:10,
      issuedNo:"-",
      select2:{queryString:window.apipath + "/api/viw",
      t:"PackMaster",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID, Code, Name, concat(SKUCode, ' : ', SKUName) AS SKU, UnitTypeName AS UnitType",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:20,
      all:"",},
      inputstatus:true,
      pageID:null,
      addstatus:true,
      adddisplay:"none",
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0

    this.branchselect = {queryString:window.apipath + "/api/mst",
      t:"Branch",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,Code, Name",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    this.warehouseselect = {queryString:window.apipath + "/api/mst",
      t:"Warehouse",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,Code, Name",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    this.customerselect = {queryString:window.apipath + "/api/mst",
       t:"Customer",
       q:'[{ "f": "Status", "c":"=", "v": 1}]',
       f:"ID,Code, Name",
       g:"",
       s:"[{'f':'ID','od':'asc'}]",
       sk:0,
       l:20,
       all:"",}
  }

  componentDidMount(){
    const values = queryString.parse(this.props.location.search)
    if(values.ID){
      
      this.setState({pageID:values.ID,
        addstatus:true,})
      Axios.get(window.apipath + "/api/wm/issued/doc/?docID=" + values.ID).then((rowselect1) => {
        if(rowselect1.data._result.status === 0){
          this.setState({data:[]})
        }
        else{
          this.setState({data:rowselect1.data.document, remark:rowselect1.data.document.remark,
          documentStatus:rowselect1.data.document.eventStatus,
          documentDate:moment(rowselect1.data.document.documentDate).format("DD-MM-YYYY"),
          date:moment(rowselect1.data.document.actionTime),
          addstatus:true,
          issuedNo:rowselect1.data.document.code})
        }
      })
    }
    else{
      this.setState({documentDate:this.DateNow.format('DD-MMMM-YYYY')})
      Axios.get(createQueryString(this.state.select2)).then((rowselect2) => {
        this.setState({autocomplete:rowselect2.data.datas,
          adddisplay:"inline-block"})
      })
    }

    this.renderDocumentStatus();
    var today = moment();
    var tomorrow = moment(today).add(1, 'days');
    this.setState({date:tomorrow})

    Axios.all([Axios.get(createQueryString(this.branchselect)),
      Axios.get(createQueryString(this.warehouseselect)),
      Axios.get(createQueryString(this.customerselect))]).then(
      (Axios.spread((branchresult, warehouseresult, customerresult) => 
    {
      this.setState({auto_branch : branchresult.data.datas,
        auto_warehouse:warehouseresult.data.datas,
        auto_customer:customerresult.data.datas,
        addstatus:false,
      }, () => {
        const auto_branch = []
        this.state.auto_branch.forEach(row => {
          auto_branch.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        const auto_warehouse = []
        this.state.auto_warehouse.forEach(row => {
          auto_warehouse.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        const auto_customer = []
        this.state.auto_customer.forEach(row => {
          auto_customer.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        this.setState({auto_branch,auto_warehouse,auto_customer})
      })}
    )))
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data){
    this.setState({selectiondata:data})
  }

  createDocument(){
    let acceptdata = []
    this.state.data.forEach(row => {
      acceptdata.push({packID:row.PackID,packQty:row.PackQty,})
    })
    let postdata = {
      refID:'', forCustomerID:null, batch:null, lot:null,
      souBranchID:this.state.branchresult,souWarehouseID:this.state.warehouseresult,souAreaMasterID:null,
      desCustomerID:this.state.customerresult,desSupplierID:null,
      actionTime:this.state.date.format("YYYY/MM/DDThh:mm:ss"),documentDate:this.DateNow.format("YYYY/MM/DD"),
      remark:this.state.remark,issueItems:acceptdata
    }
    Axios.post(window.apipath + "/api/wm/issued/doc", postdata).then((res) => {
      this.props.history.push('/wms/issueddoc/manage/issuedmanage?ID='+ res.data.ID)
    })
  }

  closePage(){
    return 
  }

  dateTimePicker(){
    return <DatePicker selected={this.state.date}
    onChange={(e) => {this.setState({date:e})}}
    onChangeRaw={(e) => {
      if (moment(e.target.value).isValid()){
        this.setState({date:e.target.value})
      }
   }}
   dateFormat="DD/MM/YYYY HH:mm:ss"/>
  }

  renderDocumentStatus(){
    for(let name in EventStatus){
      if(EventStatus[name] === this.state.documentStatus)
        return name
    }
  }

  inputCell(field, rowdata){
    return  <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.editData(rowdata, e.target.value, "PackQty")}} />;
  }
  
  addData(){
    const data = this.state.data
    data.push({ID:this.addIndex,PackItem:"",PackQty:0,SKU:"",UnitType:"", PackID:""})
    this.addIndex += 1
    this.setState({data})
  }

  editData(rowdata, value, field){
    const data = this.state.data;
    if(rowdata.column.datatype === "int"){
      let conv = value === '' ? 0 : value
      const type = isInt(conv)
      if(type){
        data[rowdata.index][field] = (conv === 0 ? null : conv);
      }
      else{
        alert("੾�е���Ţ��ҹ��")
      }
    }
    else{
      data[rowdata.index][field] = value.Code;
      data[rowdata.index]["SKU"] = value.SKU;
      data[rowdata.index]["UnitType"] = value.UnitType;
      data[rowdata.index]["PackID"] = value.ID;
    }
    this.setState({ data });
  }

  createText(data,field){
    let datafield = data.filter(row => row.ID === field)
    let result = datafield.map(row => {return <span key={row.Code}>{row.Code + ' : ' + row.Name}</span>})
    return result
  }
  
  createAutoCompleteCell(rowdata){
    const style = {borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%',
    zIndex: '998',}
    if(this.state.autocomplete.length > 0){
      return <ReactAutocomplete
        menuStyle={style}
        getItemValue={(item) => item.Code + ' : ' + item.Name}
        items={this.state.autocomplete}
        shouldItemRender={(item, value) => item.Code.toLowerCase().indexOf(value.toLowerCase()) > -1}
        renderItem={(item, isHighlighted) =>
          <div key={item.ID} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
            {item.Code + ' : ' + item.Name}
          </div>
        }
        value={rowdata.value}
        onChange={(e) => {
          rowdata.value = e.target.value
          this.editData(rowdata, e.target.value, rowdata.column.id)
        }}
        onSelect={(val, row) => {
          this.editData(rowdata, row, rowdata.column.id)
        }}
      />
    }
  }

  render(){
    const style={width:"100px", textAlign:"right", paddingRight:"10px"}
    let cols
    if(this.state.pageID){
      cols = [
        {accessor:"packMaster_Code",Header:"Pack Item", Cell: (e) => <span>{e.original.packMaster_Code + ' : ' + e.original.packMaster_Name}</span>},
        {accessor:"skuMaster_Code",Header:"SKU", Cell: (e) => <span>{e.original.skuMaster_Code + ' : ' + e.original.skuMaster_Name}</span>},
        {accessor:"quantity",Header:"PackQty", Cell: (e) => <span>{e.original.quantity}</span>},
        {accessor:"unitType_Name",Header:"UnitType", Cell: (e) => <span>{e.original.unitType_Name}</span>}
      ]
    }
    else{
      cols = [
        {accessor:"PackItem",Header:"Pack Item", editable:true, Cell: (e) => this.createAutoCompleteCell(e),},
        {accessor:"SKU",Header:"SKU",},
        {accessor:"PackQty",Header:"PackQty", editable:true, Cell: e => this.inputCell("qty", e), datatype:"int"},
        {accessor:"UnitType",Header:"UnitType",},
        {Cell:(e) => <Button onClick={()=>{
          const data = this.state.data;
          data.forEach((row, index)=>{
            if(row.ID === e.original.ID){
              data.splice(index, 1)
            }
          })
          this.setState({data})
        }}>Remove</Button>}
      ]
    }
    
    return(
      <div>
        <div className="clearfix">
          <div className="float-right">
            <div>Document Date : <span>{this.state.documentDate}</span></div>
            <div>Event Status : {this.renderDocumentStatus()}</div>
          </div>
          <div className="d-block"><label style={style}>Issued No : </label><span>{this.state.issuedNo}</span></div>
          <div className="d-block"><label style={style}>Action Time : </label><div style={{display:"inline-block"}}>{this.state.pageID ? <span>{this.state.date.format("DD-MM-YYYY hh:mm:ss")}</span> : this.dateTimePicker()}</div></div>
        </div>
        <div className="clearfix">
          <Row>
            <div className="col-6">
              <div className=""><label style={style}>Branch : </label>{this.state.pageID ? this.createText(this.state.auto_branch, this.state.data.sou_Branch_ID) : 
                <div style={{width:"300px", display:"inline-block"}}><AutoSelect data={this.state.auto_branch} result={(e) => this.setState({"branch":e.value, "branchresult":e.label})}/></div>}</div>
              <div className=""><label style={style}>Customer : </label>{this.state.pageID ? this.createText(this.state.auto_customer, this.state.data.des_Customer_ID) : 
                <div style={{width:"300px", display:"inline-block"}}><AutoSelect data={this.state.auto_customer} result={(e) => this.setState({"customer":e.value, "customerresult":e.label})}/></div>}</div>
            </div>
            <div className="col-6">
              <div className=""><label style={style}>Warehouse : </label>{this.state.pageID ? this.createText(this.state.auto_warehouse, this.state.data.sou_Warehouse_ID) : 
                <div style={{width:"300px", display:"inline-block"}}><AutoSelect data={this.state.auto_warehouse} result={(e) => this.setState({"warehouse":e.value, "warehouseresult":e.label})}/></div>}</div>
              <div className=""><label style={style}>Remark : </label>
              {this.state.pageID ? <span>{this.state.remark}</span> : 
              <Input onChange={(e) => this.setState({remark:e.target.value})} style={{display:"inline-block", width:"300px"}}
              value={this.state.remark === undefined ? "" : this.state.remark}/>}
              </div>
            </div>
          </Row>
        </div>
        <Button onClick={() => this.addData()} color="primary"className="mr-sm-1" disabled={this.state.addstatus} style={{display:this.state.adddisplay}}>Add</Button>
        <ReactTable columns={cols} minRows={10} data={this.state.data.documentItems === undefined ? this.state.data : this.state.data.documentItems} sortable={false} style={{background:'white'}}
            showPagination={false}/>
        <Card>
          <CardBody>
            <Button onClick={() => this.createDocument()} style={{display:this.state.adddisplay}} color="primary"className="mr-sm-1">Create</Button>
            <Button style={{color:"#FFF"}} type="button" color="info" onClick={() => this.props.history.push('/wms/issueddoc/manage')}>Close</Button>
          </CardBody>
        </Card>

      </div>
    )
  }
}

export default IssuedManage;

import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import {Input, Card, CardBody, Button, Row} from 'reactstrap';
import ReactTable from 'react-table'
import Axios from 'axios';
import ReactAutocomplete from 'react-autocomplete';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import EventStatus from '../../EventStatus'
import queryString from 'query-string'


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
      select:{queryString:"https://localhost:44366/api/viw",
      t:"Document",
      q:'[{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
      f:"ID,Code,",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:20,
      all:"",},
      
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.DateNow = moment()

    this.branchselect = {queryString:"https://localhost:44366/api/mst",
      t:"Branch",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,Code, Name",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    this.warehouseselect = {queryString:"https://localhost:44366/api/mst",
      t:"Warehouse",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,Code, Name",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    this.customerselect = {queryString:"https://localhost:44366/api/mst",
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

    if(values.ID !== undefined){
      const select = this.state.select
      const whereselect = JSON.parse(select.q)
      whereselect.push({ 'f': 'ID', 'c':'=', 'v': values.ID})
      select.q = JSON.stringify(whereselect)
      this.setState({select})
      Axios.get(createQueryString(this.branchselect))
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
        auto_customer:customerresult.data.datas
      })}
    )))
  }

  createAutocomplete(data,field){
    const style = {borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%',
    zIndex: '998',}

    return <ReactAutocomplete
      menuStyle={style}
      getItemValue={(item) => item.Code + ' : ' + item.Name}
      items={data}
      shouldItemRender={(item, value) => item.Code.toLowerCase().indexOf(value.toLowerCase()) > -1}
      renderItem={(item, isHighlighted) =>
        <div key={item.Code} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
          {item.Code + ' : ' + item.Name}
        </div>
      }
      value={this.state[field]}
      onChange={(e) => {
        this.setState({[field]:e.target.ID})
      }}
      onSelect={(val, row) => {
        this.setState({[field]:val})
      }}
    />
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data){
    this.setState({selectiondata:data})
  }

  createDocument(){
    let postdata = {docIDs:[]}
    Axios.post("https://localhost:44366/api/wm/issued/doc", postdata).then(() => this.forceUpdate())
  }

  dateTimePicker(){
    return <DatePicker selected={this.state.date}
    onChange={(e) => {this.setState({date:e})}}
    onChangeRaw={(e) => {
      console.log(moment(e.target.value).isValid())
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
    onChange={(e) => {console.log("x")}} />;
  }
  
  addData(packid, value){
    const data = this.state.data
    data.push({PackItem:"x",PackQty:0,SKU:"x",UnitType:"xxx"})
    this.setState({data})
  }

  render(){
    const style={width:"100px", textAlign:"right", paddingRight:"10px"}
    const cols = [
      {accessor:"PackItem",Header:"Pack Item", editable:true, Cell: (e) => this.inputCell("item", e),},
      {accessor:"SKU",Header:"SKU",},
      {accessor:"PackQty",Header:"PackQty", editable:true, Cell: e => this.inputCell("qty", e),},
      {accessor:"UnitType",Header:"UnitType",}
    ]

    return(
      <div>
        <div className="clearfix">
          <div className="float-right">
            <div>Document Date : <span>{this.DateNow.format('DD-MMMM-YYYY HH:mm:ss')}</span></div>
            <div>Event Status : {this.renderDocumentStatus()}</div>
          </div>
          <div className="d-block"><label style={style}>Issued No : </label><span>{this.state.issuedNo}</span></div>
          <div className="d-block"><label style={style}>Action Time : </label><div style={{display:"inline-block"}}>{this.dateTimePicker()}</div></div>
        </div>
        <div className="clearfix">
          <Row>
            <div className="col-6">
              <div className=""><label style={style}>Branch : </label>{this.createAutocomplete(this.state.auto_branch, "branch")}</div>
              <div className=""><label style={style}>Customer : </label>{this.createAutocomplete(this.state.auto_customer, "customer")}</div>
            </div>
            <div className="col-6">
              <div className=""><label style={style}>Warehouse : </label>{this.createAutocomplete(this.state.auto_warehouse, "warehouse")}</div>
              <div className=""><label style={style}>Remark : </label><input onChange={(e) => this.setState({remark:e.target.value})} value={this.state.remark === undefined ? "" : this.state.remark}/></div>
            </div>
          </Row>
        </div>
        <Button onClick={() => this.addData()} color="primary"className="mr-sm-1">Add</Button>
        <ReactTable columns={cols} minRows={10} data={this.state.data} sortable={false}/>
        <Card>
          <CardBody>
            <Button onClick={() => this.createDocument()} color="primary"className="mr-sm-1">Working</Button>
            <Button onClick={() => this.createDocument()} color="danger"className="mr-sm-1">Reject</Button>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default IssuedManage;

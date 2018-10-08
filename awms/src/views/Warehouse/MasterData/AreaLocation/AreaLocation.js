import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import {Input, Button, ButtonGroup , Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter  } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {AutoSelect} from '../../ComponentCore'

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

class AreaLocation extends Component{
    constructor(props) {
      super(props);

      this.state = {
        data : [],
        autocomplete:[],
        cols2:[],
        /* grouptype:0, */
        statuslist:[{
        'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
        }],
        acceptstatus : false,
       /*  select:{queryString:window.apipath + "/api/viw",
        t:"AreaLocationMaster",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,AreaMaster_ID,AreaMaster_Code,AreaMaster_Name,AreaMaster_Description,Code,Name,Description,Gate,Bank,Bay,Level,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:10,
        all:"",}, */
        warehouse:{queryString:window.apipath + "/api/mst",
        t:"Warehouse",
        q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
        f:"*",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:"",
        l:"",
        all:"",},
        supplier:{queryString:window.apipath + "/api/mst",
        t:"Supplier",
        q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
        f:"*",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:"",
        l:"",
        all:"",},
        area:{queryString:window.apipath + "/api/viw",
        t:"AreaMaster",
        q:'[{ "f": "Status", "c":"=", "v": 1}]',
        f:"ID,Code,Name,Description,Warehouse_ID,AreaMasterType_ID,GroupType",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:"",
        l:"",
        all:"",},
        sortstatus:0,
        selectiondata:[],
        warehousedata:[],
        supplierdata:[],
        areadata:[]
      };
      this.setColumns = this.setColumns.bind(this)
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this)
      this.filterList = this.filterList.bind(this)
      this.dropdownAuto = this.dropdownAuto.bind(this)
      this.autoSelectData = this.autoSelectData.bind(this)
      this.uneditcolumn = ["AreaMaster_Code","AreaMaster_Name","AreaMaster_Description","ObjectSize_Code","ObjectSize_Name","ObjectSize_Description","ModifyBy","ModifyTime","CreateBy","CreateTime"]

    } 

    createQueryStringin = (select) => {
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

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }
    
    componentWillMount(){
    this.filterList();
    }

    componentWillUnmount(){
    Axios.isCancel(true);
    }

    componentDidMount(){
      Axios.all([Axios.get(createQueryString(this.state.supplier)),
        Axios.get(createQueryString(this.state.warehouse))]).then(
        (Axios.spread((supplierresult, warehouseresult) => 
      {
        this.setState({supplierdata : supplierresult.data.datas,
          warehousedata:warehouseresult.data.datas,
        }, () => {
          const supplierdata = []
          this.state.supplierdata.forEach(row => {
            supplierdata.push({value:row.ID, label:row.Code + ' : ' + row.Name })
          })
          const warehousedata = []
          this.state.warehousedata.forEach(row => {
            warehousedata.push({value:row.ID, label:row.Code + ' : ' + row.Name })
          })
          this.setState({supplierdata,warehousedata})
        })}
      )))
    }

    autoSelectData(field, resdata, resfield){
      this.setState({[resfield]:resdata.value}, () => {
        if(field === "Warehouse"){
          const area = this.state.area
          let areawhere = JSON.parse(area.q)
          areawhere.push({'f':'warehouse_ID','c':'=','v':this.state.warehouseres})
          area.q = JSON.stringify(areawhere)
    
          Axios.get(createQueryString(this.state.area)).then((res) => {
          const areadata = []
            res.data.datas.forEach(row => {
              areadata.push({value:row.ID, label:row.Code + ' : ' + row.Name, grouptype:row.GroupType })
            })
            this.setState({areadata})
          })
        }else{
          this.setState({grouptype:resdata.grouptype})
        }
      })
    }

    dropdownAuto(data, field, fieldres){    
      return <div>
          <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>{field} : </label> 
          <div style={{display:"inline-block", width:"40%", minWidth:"200px"}}>
            <AutoSelect data={data} result={(res) => this.autoSelectData(field, res, fieldres)}/>
          </div>
        </div>
    }

    dropdownOption(obj){
      obj.map((data,index) => {
        return <option key={index} value={data.key}>{data.value}</option>
      })
    }

    filterList(){
      const objselect = {queryString:window.apipath + "/api/mst",
        t:"ObjectSize",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
        f:"ID,Code",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        all:"",}

      const areatypeselect = {queryString:window.apipath + "/api/mst",
        t:"AreaMaster",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
        f:"ID,Code",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        all:"",}
  
      Axios.all([Axios.get(this.createQueryStringin(objselect)),Axios.get(this.createQueryStringin(areatypeselect))]).then(
        (Axios.spread((objresult, areatyperesult) => 
      {
        let ddl = [...this.state.autocomplete]
        let objList = {}
        let areatypelist = {}
        objList["data"] = objresult.data.datas
        objList["field"] = "ObjectSize_Code"
        objList["pair"] = "ObjectSize_ID"
        objList["mode"] = "Dropdown"
  
        areatypelist["data"] = areatyperesult.data.datas
        areatypelist["field"] = "AreaMaster_Code"
        areatypelist["pair"] = "AreaMaster_ID"
        areatypelist["mode"] = "Dropdown"
  
        ddl = ddl.concat(objList).concat(areatypelist)
        this.setState({autocomplete:ddl})
      })))
    }

    createBarcodeBtn(){
      let barcode=[{"barcode":"xxx","Name":"nameXXX"},{"barcode":"555","Name":"name555"}]
      let barcodestr = JSON.stringify(barcode)
      return <Button type="button" color="info"
      onClick={() => this.history.push('/mst/arealocation/manage/barcode?barcodesize=1&barcodetype=qr&barcode='+barcodestr)}>Print</Button>
    }
    
    setColumns(){
      /* console.log(open)
      let myKey = open.map((data,index) => {return data.grouptype})
      var groupTypeStr = JSON.stringify(myKey)
      console.log(groupTypeStr) */
      console.log(this.state.grouptype)
      let cols1 =[]
      if(this.state.grouptype === 2){ 
        cols1 = [
        {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
        {accessor: 'Code', Header: 'Code', Type:"autolocationcode", editable:false, Filter:"text"},
        {accessor: 'Name', Header: 'Name', editable:true ,Filter:"text"},
        {accessor: 'Description', Header: 'Description', sortable:false, editable:true, Filter:"text"},
        {accessor: 'Bank', Header: 'Bank', editable:true, Filter:"text"},
        {accessor: 'Bay', Header: 'Bay', editable:true, Filter:"text"},
        {accessor: 'Level', Header: 'Level', editable:true, Filter:"text"},
        {accessor: 'AreaMaster_Code', Header: 'Area Master',updateable:false,Filter:"text", Type:"autocomplete"},
        {accessor: 'ObjectSize_Code', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
        {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
        {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
        {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
        {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
        {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
      ]; 
      this.state.select = {queryString:window.apipath + "/api/viw",
        t:"AreaLocationMaster",
        q:"[{ 'f': 'Status', c:'<', 'v': 2},{ 'f':'GroupType',c:'=','v':2}]",
        f:"ID,AreaMaster_ID,AreaMaster_Code,AreaMaster_Name,AreaMaster_Description,Code,Name,Description,Gate,Bank,Bay,Level,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:10,
        all:"",}
     }else  if(this.state.grouptype === 1) {
      cols1 = [
        {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
        {accessor: 'Code', Header: 'Code', Type:"autolocationcode", editable:false, Filter:"text"},
        {accessor: 'Name', Header: 'Name', editable:true ,Filter:"text"},
        {accessor: 'Description', Header: 'Description', sortable:false, editable:true, Filter:"text"},
        {accessor: 'Gate', Header: 'Gate', editable:true, Filter:"text"},
        {accessor: 'AreaMaster_Code', Header: 'Area Master',updateable:false,Filter:"text", Type:"autocomplete"},
        {accessor: 'ObjectSize_Code', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
        {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
        {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
        {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
        {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
        {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
      ]; 
      this.state.select = {queryString:window.apipath + "/api/viw",
        t:"AreaLocationMaster",
        q:"[{ 'f': 'Status', c:'<', 'v': 2},{ 'f':'GroupType',c:'=','v':1}]",
        f:"ID,AreaMaster_ID,AreaMaster_Code,AreaMaster_Name,AreaMaster_Description,Code,Name,Description,Gate,Bank,Bay,Level,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:10,
        all:"",}
    }else{
      cols1 = [
        {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
        {accessor: 'Code', Header: 'Code', Type:"autolocationcode", editable:false, Filter:"text"},
        {accessor: 'Name', Header: 'Name', editable:true ,Filter:"text"},
        {accessor: 'Description', Header: 'Description', sortable:false, editable:true, Filter:"text"},
        {accessor: 'Gate', Header: 'Gate', editable:true, Filter:"text"},
        {accessor: 'Bank', Header: 'Bank', editable:true, Filter:"text"},
        {accessor: 'Bay', Header: 'Bay', editable:true, Filter:"text"},
        {accessor: 'Level', Header: 'Level', editable:true, Filter:"text"},
        {accessor: 'AreaMaster_Code', Header: 'Area Master',updateable:false,Filter:"text", Type:"autocomplete"},
        {accessor: 'ObjectSize_Code', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
        {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
        {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
        {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
        {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
        {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
      ]; 

      this.state.select = {queryString:window.apipath + "/api/viw",
        t:"AreaLocationMaster",
        q:"[{ 'f': '1', c:'=', 'v': 2}]",
        f:"ID,AreaMaster_ID,AreaMaster_Code,AreaMaster_Name,AreaMaster_Description,Code,Name,Description,Gate,Bank,Bay,Level,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:10,
        all:"",}
    }
    return cols1 
    }

    render(){
        const btnfunc = [{
          history:this.props.history,
          btntype:"Barcode",
          func:this.createBarcodeBtn
     
        }]
    
        return(
          
          <div>
            <Row>
              <Col>
                  {this.dropdownAuto(this.state.warehousedata, "Warehouse", "warehouseres")}
              </Col>
            </Row>
            <Row>
              <Col>
                  {this.dropdownAuto(this.state.areadata, "Area", "areares")}
              </Col>
            </Row>
            <Row><Col></Col></Row>
          {/*
            column = คอลัมที่ต้องการแสดง
            data = json ข้อมูลสำหรับ select ผ่าน url
            ddlfilter = json dropdown สำหรับทำ dropdown filter
            addbtn = เปิดปิดปุ่ม Add
            accept = สถานะของในการสั่ง update หรือ insert
            autocomplete = data field ที่ต้องการทำ autocomplete
            filterable = เปิดปิดโหมด filter
            getselection = เก็บค่าที่เลือก
          */}

            <TableGen column={this.setColumns()} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
                      filterable={true} autocomplete={this.state.autocomplete} accept={true} areagrouptype={this.state.grouptype}
                      btn={btnfunc} uneditcolumn={this.uneditcolumn} getselection={(res) => this.setState({test:res})}
                      table="ams_AreaLocationMaster" autocode="@@sql_gen_area_location_code"/>
          </div>  
        )   
    }
}
export default AreaLocation;
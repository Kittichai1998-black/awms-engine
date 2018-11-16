import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {apicall, createQueryString} from '../../ComponentCore'
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';

const api = new apicall()

class SKUMasterType extends Component{
    constructor(props) {
        super(props);
    
        this.state = {
          data : [],
          autocomplete:[],
          statuslist:[{
            'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
            'header' : 'Status',
            'field' : 'Status',
            'mode' : 'check',
          }],
          acceptstatus : false,
          select:{queryString:window.apipath + "/api/viw",
          t:"SKUMasterType",
          q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
          f:"ID,Code,Name,Description,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,Created,Modified",
          g:"",
          s:"[{'f':'ID','od':'asc'}]",
          sk:0,
          l:100,
          all:"",},
          sortstatus:0,
          selectiondata:[],
        };
        this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.getAutocompletee = this.getAutocomplete.bind(this);
        this.getSelectionData = this.getSelectionData.bind(this);
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.uneditcolumn = ["ObjectSize_Code","ObjectSize_Name","ObjectSize_Description","Modified","Created"]
      }
      onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
      }
    
      async componentWillMount(){
        this.getAutocomplete();
        //permission
        let data = await GetPermission()
        Nodisplay(data,45,this.props.history)
        this.displayButtonByPermission(data)
        //permission
      }
    //permission
displayButtonByPermission(perID){

  this.setState({perID:perID})
  let check = false
  perID.forEach(row => {
      if(row === 45 ){
        check = true
      }if(row === 46 ){
        check = false
      }if(row === 47 ){
        check = false
      }
    })
       if(check === true){  
        this.setState({permissionView:false})
       }else if(check === false){
        this.setState({permissionView:true})
       }
  }
  //permission

      componentWillUnmount(){
        
      }
    
      onHandleClickLoad(event){
        api.post(window.apipath + "/api/mst/TransferFileServer/SKUMstType",{})
        this.forceUpdate();
      }

      getAutocomplete(){
        const objectsizeselect = {queryString:window.apipath + "/api/mst",
          t:"ObjectSize",
          q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
          f:"ID,Code",
          g:"",
          s:"[{'f':'ID','od':'asc'}]",
          sk:0,
          all:"",}
    
        const packselect = {queryString:window.apipath + "/api/mst",
          t:"SKUMasterType",
          q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
          f:"ID,Code",
          g:"",
          s:"[{'f':'ID','od':'asc'}]",
          sk:0,
          all:"",}
    
        Axios.all([Axios.get(createQueryString(packselect)),Axios.get(createQueryString(objectsizeselect))]).then(
          (Axios.spread((packresult, objectsizeresult) => 
        {
          let ddl = this.state.autocomplete
          let packList = {}
          let objectsizeList = {}
          packList["data"] = packresult.data.datas
          packList["field"] = "SKUMasterType_Code"
          packList["pair"] = "SKUMasterType_ID"
          packList["mode"] = "Dropdown"
    
          objectsizeList["data"] = objectsizeresult.data.datas
          objectsizeList["field"] = "ObjectSize_Code"
          objectsizeList["pair"] = "ObjectSize_ID"
          objectsizeList["mode"] = "Dropdown"
    
          ddl = ddl.concat(packList).concat(objectsizeList)
          this.setState({autocomplete:ddl})
        })))
      }
    
      getSelectionData(data){
        this.setState({selectiondata:data}, () => console.log(this.state.selectiondata))
      }
    
      createBarcodeBtn(data){
        return <Button type="button" color="info" 
        onClick={() => this.history.push('/mst/sku/manage/barcode?barcodesize=4&barcode='+data.Code+'&Name='+data.Name)}>Print</Button>
      }
    
      render(){
        const cols = [
          {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed: "left"},
          {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed: "left"},
          {accessor: 'ObjectSize_Code', Header: 'ObjectSize Code',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
          {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
          /* {accessor: 'CreateTime', Header: 'Create Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
          {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
          //{accessor: 'ModifyTime', Header: 'Modify Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
          /* {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"}, */
        ];
        
        const btnfunc = [{
          history:this.props.history,
          btntype:"Barcode",
          func:this.createBarcodeBtn
        }]
        const view  = this.state.permissionView
        return(
          <div>
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
            <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={view}
            filterable={true} autocomplete={this.state.autocomplete} accept={view}
            btn={btnfunc} uneditcolumn={this.uneditcolumn}
             table="ams_SKUMasterType"/>
          </div>
        )
      }
      
      
}
export default SKUMasterType;
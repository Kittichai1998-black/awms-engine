import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {createQueryString} from '../../ComponentCore'

class Pack extends Component{
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
        t:"PackMaster",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,SKUMaster_ID,SKUCode,SKUName,PackMasterType_ID,PackCode,PackName,UnitType_ID,UnitTypeCode,UnitTypeName,Code,Name,Description,WeightKG,WidthM,LengthM,HeightM,ItemQty,Revision,Status,Created,Modified",
        g:"",
        s:"[{'f':'Code','od':'asc'}]",
        sk:0,
        l:100,
        all:"",},
        sortstatus:0,
        selectiondata:[],        
       
      };
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
      this.filterList = this.filterList.bind(this)
      this.uneditcolumn = ["SKUCode","SKUName","PackCode","PackName","UnitTypeCode","UnitTypeName","ObjCode","ObjectSizeName","Created","Modified"]
    }
    componentDidMount(){
        document.title = "Pack - AWMS"
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
    
    filterList(){
        const SKUSelect = {queryString:window.apipath + "/api/mst",
            t:"SKUMaster",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}",
            f:"ID,Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            all:"",}

        const PackTypeSelect = {queryString:window.apipath + "/api/mst",
            t:"PackMasterType",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}",
            f:"ID,Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            all:"",}

        const UnitTypeSelect = {queryString:window.apipath + "/api/mst",
            t:"UnitType",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}",
            f:"ID,Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            all:"",}

        const ObjSizeSelect = {queryString:window.apipath + "/api/mst",
            t:"ObjectSize",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}",
            f:"ID,Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            all:"",}

    Axios.all([ Axios.get(createQueryString(SKUSelect))
                ,Axios.get(createQueryString(PackTypeSelect))
                ,Axios.get(createQueryString(UnitTypeSelect))
                ,Axios.get(createQueryString(ObjSizeSelect))
            ]).then(
      (Axios.spread((SKUResult, PackTypeResult, UnitTypeResult, ObjSizeResult) => 
    {
      let ddl = [...this.state.autocomplete]
      let SKUList = {}
      let PackTypeList = {}
      let UnitTypeList = {}
      let ObjSizeList = {}
      SKUList["data"] = SKUResult.data.datas
      SKUList["field"] = "SKUCode"
      SKUList["pair"] = "SKUMaster_ID"
      SKUList["mode"] = "Dropdown"

      PackTypeList["data"] = PackTypeResult.data.datas
      PackTypeList["field"] = "PackCode"
      PackTypeList["pair"] = "PackMasterType_ID"
      PackTypeList["mode"] = "Dropdown"

      UnitTypeList["data"] = UnitTypeResult.data.datas
      UnitTypeList["field"] = "UnitTypeCode"
      UnitTypeList["pair"] = "UnitType_ID"
      UnitTypeList["mode"] = "Dropdown"

      ObjSizeList["data"] = ObjSizeResult.data.datas
      ObjSizeList["field"] = "ObjCode"
      ObjSizeList["pair"] = "ObjectSize_ID"
      ObjSizeList["mode"] = "Dropdown"

      ddl = ddl.concat(SKUList).concat(PackTypeList).concat(UnitTypeList).concat(ObjSizeList)
      this.setState({autocomplete:ddl})
    })))
    }

    render(){
        const cols = [
          //{accessor: 'Code', Header: 'Code', editable:false,Filter:"text", fixed: "left"},
          //{accessor: 'Name', Header: 'Name', editable:false,Filter:"text", fixed: "left"},
          //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
          {accessor: 'SKUCode', Header: 'SKU',updateable:false,Filter:"text", Type:"autocomplete", minWidth: 100},
          //{accessor: 'PackCode', Header: 'Pack Type',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'WeightKG', Header: 'Gross Weight (Kg.)', editable:false, Filter:"text", datatype: "int", className: "right", minWidth: 90},
          {accessor: 'UnitTypeCode', Header: 'Unit',updateable:false,Filter:"text", Type:"autocomplete", minWidth: 60, className: "left"},
          //{accessor: 'ObjCode', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
          //{accessor: 'WidthM', Header: 'Width', editable:true,Filter:"text"},
          //{accessor: 'LengthM', Header: 'Length', editable:true,Filter:"text"},
          //{accessor: 'HeightM', Header: 'Height', editable:true,Filter:"text"},
          ///{accessor: 'PickSizeQty', Header: 'Pick Size Qty', editable:true,Filter:"text",datatype:"int"},
          {accessor: 'ItemQty', Header: 'Base Unit', editable:false,Filter:"text",datatype:"int", className: "right", minWidth: 60},
          //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
          {accessor: 'Created', Header: 'Create', editable:false,filterable:false, minWidth: 180},
          /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
          {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false, minWidth: 180},
          //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
          {show: false, Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
        ]; 
      
        const btnfunc = [{
          btntype:"Barcode",
          func:this.createBarcodeBtn
        }]
    
        return(
          <div>
          {/*
            column = คอลัมที่ต้องการแสดง
            data = json ข้อมูลสำหรับ select ผ่าน url
            ddlfilter = json dropdown สำหรับทำ dropdown filter
          */}
          <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} 
                  filterable={true} autocomplete={this.state.autocomplete} accept={false} exportbtn={false} addbtn={false} 
                  btn={btnfunc} uneditcolumn={this.uneditcolumn} expFilename={"Pack"}
            table="ams_PackMaster"/>
          </div>
        )
      }
}

export default Pack;
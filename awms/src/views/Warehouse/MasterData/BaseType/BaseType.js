import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {createQueryString} from '../../ComponentCore'

class BaseType extends Component{
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
        t:"BaseMasterType",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,Code,Name,Description,UnitType_ID,UnitType_Code,Status,Created,Modified",
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
      this.uneditcolumn = ["UnitType_Code","Created","Modified"]
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
        const UnitTypeSelect = {queryString:window.apipath + "/api/mst",
            t:"UnitType",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}",
            f:"ID,concat(Code,' : ',Name) as Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            all:"",}

        Axios.all([Axios.get(createQueryString(UnitTypeSelect))]).then(
            (Axios.spread((UnitTypeResult) => 
        {
            let ddl = [...this.state.autocomplete]
            let UnitTypeList = {}
            UnitTypeList["data"] = UnitTypeResult.data.datas
            UnitTypeList["field"] = "UnitType_Code"
            UnitTypeList["pair"] = "UnitType_ID"
            UnitTypeList["mode"] = "Dropdown"

            ddl = ddl.concat(UnitTypeList)
            this.setState({autocomplete:ddl})
        })))
    }

    render(){
        const cols = [
          {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed: "left"},
          {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed: "left"},
          //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
          {accessor: 'UnitType_Code', Header: 'Unit Type',updateable:false,Filter:"text", Type:"autocomplete"},
          //{accessor: 'GroupType', Header: 'Group Type', editable:true,Filter:"text"},
          //{accessor: 'SizeLevel', Header: 'Size Level', editable:true,Filter:"text"},
          //{accessor: 'InnerSizeLevels', Header: 'Inner Size Levels', editable:true,Filter:"text"},
          {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
          {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
          /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
          {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
          //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
          {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
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
            <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} exportbtn={true} expFilename={"BaseType"}
                  filterable={true} autocomplete={this.state.autocomplete} accept={true}
                  btn={btnfunc} uneditcolumn={this.uneditcolumn}
            table="ams_BaseMasterType"/>
          </div>
        )
      }
}

export default BaseType;

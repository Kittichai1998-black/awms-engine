import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class ObjectSize extends Component{
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
            ObjectTypelist:[{
                0:{'ID': 0,'Code' : 'Location'},
                1:{'ID': 1,'Code' : 'Base'},
                2:{'ID': 2,'Code' : 'Pack'},
            }],
            acceptstatus : false,
            select:{queryString:window.apipath + "/api/mst",
                t:"ObjectSize",
                q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
                f:"ID,Code,Name,Description,ObjectType,MinWeigthKG,MaxWeigthKG,Status,CreateBy as Created,ModifyBy as Modified",
                g:"",
                s:"[{'f':'Code','od':'asc'}]",
                sk:0,
                l:100,
                all:"",
            },
            sortstatus:0,
            selectiondata:[],
        };
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.filterList = this.filterList.bind(this)
        this.uneditcolumn = ["Created","Modified"]
    }

    componentWillUnmount(){
        Axios.isCancel(true);
    }

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }

    componentWillMount(){
        this.filterList();
      }

     filterList(){
        let ddl = this.state.autocomplete
        let ObjTypeList = {}
        ObjTypeList["data"] = this.state.ObjectTypelist
        ObjTypeList["field"] = "ObjectType"
        ObjTypeList["pair"] = "ObjectType"
        ObjTypeList["mode"] = "Dropdown"

        //ddl = ObjTypeList
        this.setState({autocomplete:ObjTypeList})
        
/*
       const whselect = {queryString:window.apipath + "/api/mst",
        t:"Branch",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
        f:"ID,Code",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        all:"",}
  
      Axios.all([Axios.get(createQueryString(whselect))]).then(
        (Axios.spread((whresult) => 
      {
        let ddl = [...this.state.autocomplete]
        let whList = {}
        whList["data"] = whresult.data.datas
        whList["field"] = "Branch_Code"
        whList["pair"] = "Branch_ID"
        whList["mode"] = "Dropdown"
  
        ddl = ddl.concat(whList)
        this.setState({autocomplete:ddl})
      })))
        */
    } 

    render(){
        const cols = [
          {accessor: 'Code', Header: 'Code', editable:true, Filter:"text", fixed: "left"},
          {accessor: 'Name', Header: 'Name', editable:true, Filter:"text", fixed: "left"},
          //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
          {accessor: 'ObjectType', Header: 'Object Type',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'MinWeigthKG', Header: 'Minimun Weigth(Kg.)', editable:true,Filter:"text",},
          {accessor: 'MaxWeigthKG', Header: 'Maximun Weigth(Kg.)', editable:true,Filter:"text",},
          {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
          {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
          {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
          {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
        ]; 

        const btnfunc = [{
            btntype:"Barcode",
            func:this.createBarcodeBtn
          }]
    
        return(
          <div>
          <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
                  btn={btnfunc} filterable={true} autocomplete={this.state.autocomplete} accept={true} uneditcolumn={this.uneditcolumn}
            table="ams_ObjectSize"/>
          </div>
        )
    }
}
export default ObjectSize;
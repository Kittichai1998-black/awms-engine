import React, { useState, useEffect } from "react";
import Table from "../../components/AmTable/AmTable";

const columns=[
  {
    Header: ()=> <div>TEST ID</div>,
    accessor: 'ID',
    //width:200,
    fixed: 'left',
    headerStyle:{},
    colStyle:{color:"black"},
    sortable:false,
    filterable:false,
    Filter:()=> {return <div>XXX</div>},
    type:"number"
  },
  {
    Header: 'Name',
    accessor: 'Name',
    //width:300,
    sortable:false,
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    width:200,
    filterable:true,
    sortable:false,
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    width:200,
    filterable:true,
    sortable:false,
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    //width:200,
    filterable:true,
    sortable:false,
  }];

const data = [{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name2",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name3",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name3",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name5",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      }
    ];

const TableDev = (props) => {
    return <>
    <Table container={props} columns={columns} rowNumber={true}
    height={200}
    selection={"checkbox"}
    selectionData={(seldata) => {console.log(seldata)}} 
    dataSource={data} cellStyle={(cellData) => {
      if(cellData === "Name2"){
        return {color:"red"}
      }
    }}
    key={"ID"}/>
    <br/>

    </>
}

export default TableDev;
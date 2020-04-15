import React, { useState, useEffect } from "react";
import Table from "../../components/AmTable/AmTable";

const columns=[
  {
    Header: 'ID',
    accessor: 'ID',
    width:100,
    fixed: 'left',
    style:{background:"green"},
    sortable:false,
    type:"number"
  },
  {
    Header: 'Name',
    accessor: 'Name',
    width:300,
    sortable:false,
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    width:200,
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
        },
        style:{background:"red"}
      },{
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
        "Name2":"Name2",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name2",
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
    }];

const TableDev = (props) => {
    return <>
    <Table container={props} columns={columns} rowNumber={true} 
    selection={"checkbox"}
    selectionData={(seldata) => {console.log(seldata)}} 
    dataSource={data}/>
    <br/>
    <Table container={props} columns={columns} rowNumber={true}/>
    </>
}

export default TableDev;
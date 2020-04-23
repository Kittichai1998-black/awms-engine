import React, { useState, useEffect } from "react";
import Table from "../../components/AmTable/AmTable";
import { CardFooter } from "reactstrap";

const columns=[
  {
    Header: ()=> <div>TEST ID</div>,
    accessor: 'ID',
    code:'ID',
    //width:200,
    fixed: 'left',
    style:{},
    colStyle:{color:"black"},
    sortable:false,
    filterable:false,
    Filter:()=> {return <div>XXX</div>},
    type:"number",
    Footer:(data, datafield, col)=>{return <div>Total : {datafield[datafield.length-1].value}</div>}
  },
  {
    Header: 'Name',
    accessor: 'Name',
    code:'Name',
    //width:300,
    sortable:false,
    style:{background:"blue"}
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    code:'Name2',
    width:200,
    filterable:true,
    sortable:false,
    Cell:(e)=>{return <div>{e.value}</div>},
    Footer:(data, datafield, col)=>{return <div>Total : {datafield[datafield.length-1].value}</div>}
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    code:'Name2',
    width:200,
    filterable:true,
    sortable:false,
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    code:'Name2',
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
      dataSource={data}
      
      key={"ID"}
      subComponent={true}
      tableStyle={{color:"black"}}
      footerStyle={(data, datafield, col)=>{
        const style = {}
        if(datafield[datafield.length-1].value > 0)
          style.background="red"

        return style;
      }}
      headerStyle={{color:"red"}}
    />
    </>
}

export default TableDev;
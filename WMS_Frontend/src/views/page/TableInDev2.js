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
    //colStyle:{color:"black"},
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
    //style:{background:"blue"}
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
    Header: 'Quantity',
    accessor: 'Quantity',
    code:'Quantity',
    width:200,
    filterable:true,
    sortable:false,
    type:"number"
  },
  {
    Header: 'Quantity2',
    accessor: 'Quantity2',
    code:'Quantity2',
    width:200,
    filterable:true,
    Filter:(field, functionUpdate)=>{
      //onChange(field, "xxx")
      return <input type="input" onKeyPress={(e)=>{if(e.key==="Enter")functionUpdate(field, e.target.value)}}></input>
    },
    sortable:false,
    type:"number"
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
        "Name":"12",
        "Name2":"Name2",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":2,
        "Name":"12",
        "Name2":"Name3",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":3,
        "Name":"12",
        "Name2":"Name3",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":4,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":5,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":6,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":7,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":8,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":9,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":10,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":11,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":12,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":13,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":14,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":15,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":16,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":17,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":18,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":19,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        }
      },{
        "ID":20,
        "Name":"12",
        "Name2":"10",
        "Quantity":10,
        "Quantity2":20,
        "subComponent":{
          "subData":()=>{},
          "subComponent":()=>{}
        },
      }
    ];

const TableDev = (props) => {
    return <>
    <Table container={props} columns={columns} rowNumber={true}
      height={200}
      selectionData={(seldata) => {console.log(seldata)}} 
      dataSource={data}
      selection="selection"
      dataKey="ID"
      subComponent={true}
      filterable={true}
      filter={true}
      filterData={(filter)=> {console.log(filter)}}
      //tableStyle={{color:"black"}}
      footerStyle={(data, datafield, col)=>{
        const style = {}
        if(datafield[datafield.length-1].value > 0)
          //style.background="red"

        return style;
      }}
      //headerStyle={{color:"red"}}
      groupBy={{"field":["Name","Name2"], "sumField":["Quantity","Quantity2"]}}
    />
    </>
}

export default TableDev;
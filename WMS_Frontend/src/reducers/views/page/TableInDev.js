import React, { useState, useEffect } from "react";
import Table from "../../components/table/AmTableV2";
import AmPagination from "../../components/table/AmPagination";
import AmInput from "../../components/AmInput";

const columns=[
    {
      Header: 'ID',
      accessor: 'ID',
      width:50,
      fixed: 'left',
      sortable:false,
      type:"number"
    },
    {
      Header: 'Blank',
      width:300,
      sortable:false,
      Filter:(field, event)=>{return <AmInput onChange={(e)=>event(field,e)}/>},
      Cell:(e) => {
          return <div>{"TEST"}</div>
      },
      Footer:true,
      sumData:"100"
    },
    {
      Header: 'Name',
      accessor: 'Name',
      width:200,
      filterable:true,
      Filter:(field, event)=>{return <AmInput onChange={(e)=>event(field,e)}/>},
      sortable:false,
    },
    {
      Header: 'Name',
      accessor: 'Name',
      width:1000,
      sortable:true,
    },
    {
      Header: 'Name2',
      accessor: 'Name2',
      width:1000,
      style:{"textAlign":"center"}
    }];

const data = [{
        "ID":1,
        "Name":"Name1",
        "Name2":"Name2"
        },
        {
            "ID":2,
            "Name":"Name1",
            "Name2":"Name2"
        },
        {
            "ID":3,
            "Name":"Name1",
            "Name2":"Name2"
        },
        {
            "ID":4,
            "Name":"Name1",
            "Name2":"Name2"
        },
        {
            "ID":5,
            "Name":"Name1",
            "Name2":"Name2"
        },
        {
            "ID":6,
            "Name":"Name1",
            "Name2":"Name2",
        }]

const TableDev = () => {
    const [page, setPage] = useState(0);

    return <>
    <Table
      //require
      data={data} 
      columns={columns}
      //selection
      primaryKey={"ID"}
      selection={false}
      selectionType={"checkbox"}
      //page
      rowNumber={false}
      currentPage={0}
      pageSize={20}
      //filter
      filterable={true}
      filterData={(filterdata) => console.log(filterdata)}
      //custom
      renderCustomTopLeft={<button>Left</button>}
      renderCustomTopRight={<button>Right</button>}
      renderCustomBtmLeft={<button>Btm</button>}
      maxHeight="600px" //default 500px
    />
    <AmPagination
      //จำนวนข้อมูลทั้งหมด
      totalSize={20} 
      //จำนวนข้อมูลต่อหน้า
      pageSize={20}
      //return หน้าที่ถูกกด : function
      onPageChange={(page) => setPage(page)}/>
    </>
}

export default TableDev;
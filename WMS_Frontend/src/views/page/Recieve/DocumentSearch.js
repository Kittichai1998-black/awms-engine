import React, { useState, useEffect } from "react";
import AmDocumentSearch from "../pageComponent/AmDocumentSearch"
import AmIconStatus from "../../components/AmIconStatus";
import AmButton from '../../components/AmButton';

const getStatusCode = (statusCode) => {
  const DocumentEventStatus = [
    {status:'IDLE' , code:10,},
    {status:'WORKING' , code:11,},
    {status:'WORKED' , code:12,},
    {status:'REMOVING' , code:21,},
    {status:'REMOVED' , code:22,},
    {status:'REJECTING' , code:23,},
    {status:'REJECTED' , code:24,},
    {status:'CLOSING' , code:31,},
    {status:'CLOSED' , code:32,},
    {status:'WAIT' , code:812,}
  ];
  console.log(statusCode)
  let status = DocumentEventStatus.find(x => x.code === statusCode).status;
  return <AmIconStatus styleType={status} style={{width:"120px"}}>{status}</AmIconStatus>
}

export default () => {
    const iniCols=[
        {
          Header: 'ID',
          accessor: 'ID',
          fixed: 'left',
          sortable:false,
        },
        {
          Header:"EventStatus",
          accessor: 'EventStatus',
          width:130,
          Cell:(dataRow)=>getStatusCode(dataRow.value)
        },
        {
          Header: 'Code',
          accessor: 'Code',
          width:200,
          sortable:false,
        },
        {
          Header: 'SouBranchName',
          accessor: 'SouBranchName',
          width:200,
        },
        {
          Header:"SouWarehouseName",
          accessor: 'SouWarehouseName',
          width:200,
        },
        {
          Header:"SouAreaName",
          accessor: 'SouAreaName',
          width:200,
        },
        {
          Header:"DesCustomerName",
          accessor: 'DesCustomerName',
          width:200,
        },
        {
          Header:"DesBranchName",
          accessor: 'DesBranchName',
          width:200,
        },
        {
          Header:"DesWarehouseName",
          accessor: 'DesWarehouseName',
          width:200,
        },
        {
          Header:"DesSupplierName",
          accessor: 'DesSupplierName',
          width:200,
        },
        {
          Header:"ForCustomer",
          accessor: 'ForCustomer',
          width:200,
        },
        {
          Header:"Batch",
          accessor: 'Batch',
          width:200,
        },
        {
          Header:"Lot",
          accessor: 'Lot',
          width:200,
        },
        {
          Header:"ActionTime",
          accessor: 'ActionTime',
          width:200,
        },
        {
          Header:"DocumentDate",
          accessor: 'DocumentDate',
          width:200,
        },
        {
          Header:"RefID",
          accessor: 'RefID',
          width:200,
        },
        {
          Header:"Ref1",
          accessor: 'Ref1',
          width:200,
        },
        {
          Header:"Ref2",
          accessor: 'Ref2',
          width:200,
        },
        {
          Header:"Remark",
          accessor: 'Remark',
          width:200,
        },
        {
          Header:"Created",
          accessor: 'Created',
          width:200,
        },
        {
          Header:"ModifyBy",
          accessor: 'ModifyBy',
          width:200,
        },
        {
          Header:"LastUpdate",
          accessor: 'LastUpdate',
          width:200,
        }];

    const search = [{"label":"Code","field":"Code", "searchType":"input" },
      {
        "label":"SouBranchName",
        "field":"Status",
        "searchType":"multipledropdown", 
        "dropdownData":[{"value":0,"label":"Inactive"},{"value":1,"label":"Active"},{"value":2,"label":"Remove"},{"value":3,"label":"Done"}],
        "fieldDataKey":"value", 
        "fieldLabel":"label"
      },
      {"label":"EventStatus","field":"EventStatus","searchType":"input", },
      {"label":"SouBranch","field":"SouBranchName","searchType":"input" },
      {"label":"SouWarehouse","field":"SouWarehouseName","searchType":"input", },
      {"label":"SouArea","field":"SouAreaName","searchType":"input", },
      {"label":"DesCustomer","field":"DesCustomerName","searchType":"input", },
      {"label":"DesBranch","field":"DesBranchName","searchType":"input", },
      {"label":"DesWarehouse","field":"DesWarehouseName","searchType":"input", },
      {"label":"DesSupplier","field":"DesSupplierName","searchType":"input", },
      {"label":"ForCustomer","field":"ForCustomer","searchType":"input", },
      {"label":"Batch","field":"Batch","searchType":"input", },
      {"label":"Lot","field":"Lot","searchType":"input", },
      {"label":"ActionTime","field":"ActionTime","searchType":"input", },
      {"label":"DocumentDate","field":"DocumentDate","searchType":"input", },
      {"label":"RefID","field":"RefID","searchType":"input", },
      {"label":"Ref1","field":"Ref1","searchType":"input", },
      {"label":"Ref2","field":"Ref2","searchType":"input", },
      {"label":"Remark","field":"Remark","searchType":"input", },
    ]

    const primarySearch=[
      {"label":"Doc.Date From: ","field":"CreateTime","searchType":"datepicker","typedate":"date","dateSearchType":"dateFrom" },
      {"label":"Doc.Date To: ","field":"CreateTime","searchType":"datepicker","typedate":"date","dateSearchType":"dateTo" }
    ]
    return (
    <div>
        <AmDocumentSearch 
            columns={iniCols}
            primarySearch={primarySearch} 
            expensionSearch={search}
            docTypeCode="1001"
            /* selection={true}
            renderActionButton={(selection) => { return (
            <div style={{float:"right"}}>
              <AmButton styleType="confirm" onClick={()=>{console.log(selection)}}>Accept</AmButton>
              <AmButton onClick={()=>{console.log(selection)}} styleType="delete">Cancel</AmButton>
            </div>
            )}} */
        />
    </div>)
}
import React, { useState, useEffect,useContext  } from "react";
import AmIconStatus from "../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import AmStorageObjectMulti from "../pageComponent/AmStorageObjectMulti";

import { apicall, createQueryString } from '../../components/function/CoreFunction'
import AmEntityStatus from "../../components/AmEntityStatus";
import AmButton from "../../components/AmButton";
const Axios = new apicall()


//======================================================================
const StorageObjectExample = (props) => {

    const UnitTypeQuery = {
         queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "UnitType",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    const AreaMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
       t: "AreaMaster",
       q: '[{ "f": "Status", "c":"<", "v": 2}]',
       f: "*",
       g: "",
       s: "[{'f':'ID','od':'asc'}]",
       sk: 0,
       l: 100,
       all: "",
   }

    const AreaLocationMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
       t: "AreaLocationMaster",
       q: '[{ "f": "Status", "c":"<", "v": 2}]',
       f: "*",
       g: "",
       s: "[{'f':'ID','od':'asc'}]",
       sk: 0,
       l: 100,
       all: "",
   }
   const WarehouseQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
    }

    const DocumentEventStatus = [
        {label:'NEW' , value:'NEW',},
        {label:'WORKING' , value:'WORKING',},
        {label:'WORKED' , value:'WORKED',},
        {label:'REMOVING' , value:'REMOVING',},
        {label:'REMOVED' , value:'REMOVED',},
        {label:'REJECTING' , value:'REJECTING',},
        {label:'REJECTED' , value:'REJECTED',},
        {label:'CLOSING' , value:'CLOSING',},
        {label:'CLOSED' , value:'CLOSED',},
        {label:'WAIT' , value:'WAIT',},
        {label:'RECEIVED' , value:'RECEIVED',},
        {label:'RECEIVING' , value:'RECEIVING',},
        {label:'PICKING' , value:'PICKING',},
        {label:'PICKED' , value:'PICKED',},
        {label:'HOLD' , value:'HOLD',}
      ];

    const iniCols=[
            { Header: 'Status',accessor: 'Status',fixed: 'left',width:100,sortable:false,Cell:(e)=>getStatus(e.original)},
            { Header: 'Pallet',accessor: 'Pallet', width:150,},
            { Header: 'SKU_Code',accessor: 'SKU_Code', width:200,Cell:(e)=>getData(e.original.SKU_Code)},
            { Header: 'SKU_Name',accessor: 'SKU_Name', width:300,Cell:(e)=>getData(e.original.SKU_Name)},
            { Header: 'Warehouse',accessor: 'Warehouse',width:120,Cell:(e)=>getData(e.original.Warehouse)},
            { Header: 'Area',accessor: 'Area', width:130,Cell:(e)=>getData(e.original.Area)},
            { Header: 'Location',accessor: 'Location', width:120,Cell:(e)=>getData(e.original.Location)},
            { Header: 'Batch',accessor: 'Batch', width:120,Cell:(e)=>getData(e.original.Batch)},
            { Header: 'Lot',accessor: 'Lot', width:120,Cell:(e)=>getData(e.original.Lot)},
            { Header: 'OrderNo',accessor: 'OrderNo',width:120,Cell:(e)=>getData(e.original.OrderNo)},
            { Header: 'Qty',accessor: 'Qty',dataType:'number',width:120,Cell:(e)=>getData(e.original.Qty)},
            { Header: 'Base_Unit',accessor: 'Base_Unit', width:100,Cell:(e)=>getData(e.original.Base_Unit)},
            { Header: 'Weigth PalletPack',accessor: 'Wei_PalletPack', width:130,type:'number',Cell:(e)=>getData(e.original.Wei_PalletPack)},
            { Header: 'Weigth Pack',accessor: 'Wei_Pack', width:120,type:'number',Cell:(e)=>getData(e.original.Wei_Pack)},
            { Header: 'Weigth PackStd',accessor: 'Wei_PackStd', width:120,type:'number',Cell:(e)=>getData(e.original.Wei_PackStd)},
            { Header: 'Received Date',accessor: 'Receive_Time', width:120,type:'datetime',dateFormat:'DD/MM/YYYY HH:mm',}
        ];
        
        const getData =(value) => {
            return <div style={{whiteSpace: "nowrap"}}><div style={{whiteSpace: "pre-line"}}>{value}</div></div>       
        }
        const iniCols2=[
            'SKU_Code','SKU_Name','Warehouse','Area','Location','Batch','Lot','OrderNo','Qty','Base_Unit','Wei_PalletPack','Wei_Pack','Wei_PackStd'          
            ];
        const getStatus =(value) => {
            return <AmIconStatus styleType={value.Status} >{value.Status}</AmIconStatus>       
        }
        const primarySearch=[
            {"label":"Pallet","field":"Pallet","searchType":"input","placeholder":"Pallet"},
            {"label":window.project === "TAP" ? "Part NO." : 'SKU Code',"field":"SKU_Code","searchType":"input","placeholder":window.project === "TAP" ? "Part NO." : 'SKU Code' },

        ]

      const colsLocation = [
        {
            Header: 'Code',
            accessor: 'Code',
            fixed: 'left',
            width: 100,
            sortable: true,
        },
        {
            Header: 'Name',
            accessor: 'Name',
            sortable: true,
        },
      ];
      const search = [
        {"label":"Status","field": "Status","searchType":"status","typeDropdow":"normal","name":"Status","dataDropDow":DocumentEventStatus,"placeholder":"Status"},    
        {"label":window.project === "TAP" ? "Part Name" : 'SKU Name',"field":"SKU_Name","searchType":"input","placeholder":window.project === "TAP" ? "Part Name" : 'SKU Name' },
        {"label":"Warehouse","field":"Warehouse","searchType":"dropdown","typeDropdow":"search","name":"Warehouse","dataDropDow":WarehouseQuery,"placeholder":"Warehouse","fieldLabel":["Code","Name"],"fieldDataKey":"Name"},
        {"label":"Area","field":"Area","searchType":"dropdown","typeDropdow":"search","name":"Area","dataDropDow":AreaMasterQuery,"placeholder":"Area","fieldLabel":["Code","Name"],"fieldDataKey":"Name"},
        {"label":"Location","field": "Location","searchType":"findPopup","colsFindPopup":colsLocation,"name":"Location","dataDropDow":AreaLocationMasterQuery,"placeholder":"Location","labelTitle":"Search of Location","fieldLabel":["Code", "Name"],"fieldDataKey":"Code"},
        {"label":"Batch","field":"Batch","searchType":"input","placeholder":"Batch" },
        {"label":"Lot","field":"Lot","searchType":"input","placeholder":"Lot" },
        {"label":"OrderNo","field":"OrderNo","searchType":"input","placeholder":"OrderNo" },
        {"label":"Qty","field":"Qty","searchType":"input","placeholder":"Qty" },
        {"label":"Unit Type","field":"Base_Unit","searchType":"dropdown","typeDropdow":"search","name":"Unit Type","dataDropDow":UnitTypeQuery,"placeholder":"Unit Type","fieldLabel":["Code","Name"],"fieldDataKey":"Code"},
        {"label":"Wei PalletPack","field":"Wei_PalletPack","searchType":"input","placeholder":"Weigth PalletPack" },
        {"label":"Weigth Pack","field":"Wei_Pack","searchType":"input","placeholder":"Weigth Pack" },
        {"label":"Weigth PackStd","field":"Wei_PackStd","searchType":"input","placeholder":"Weigth PackStd" },
        {"label":"Date From: ","field":"Receive_Time","searchType":"datepicker","typedate":"date","dateSearchType":"dateFrom" },
        {"label":"Date To: ","field":"Receive_Time","searchType":"datepicker","typedate":"date","dateSearchType":"dateTo" }
    ]
    return (
       <div>
         <AmStorageObjectMulti
            primarySearch={primarySearch} 
            expensionSearch={search}
            tableQuery={"r_StorageObject"} 
            iniCols={iniCols} 
            cols={iniCols2}
            selection={false}
            //randerModefybuttonB4={<AmButton  style={{marginRight:"5px"}} styleType="add">xxx</AmButton>}
            //dataSourceModefybuttonB4={}
             /> 
       </div>
          
    )
}


export default StorageObjectExample;
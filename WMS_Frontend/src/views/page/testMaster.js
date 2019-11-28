
import React, { useState, useEffect,useContext  } from "react";
import AmIconStatus from "../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import MasterData from "../pageComponent/MasterData";
import styled from 'styled-components'
import AmInput from "../../components/AmInput";
import Clone from '../../components/function/Clone'
import AmButton from "../../components/AmButton";
import Grid from '@material-ui/core/Grid';
import { apicall, createQueryString } from '../../components/function/CoreFunction'
const Axios = new apicall()

const SKUMasterTypeQuery = {
    queryString: "https://localhost:44366/api/viw",
    t: "SKUMasterType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
//======================================================================
const TestMaster = (props) => {
    const [dataSrc, setDataSrc] = useState([]);
    useEffect(() => {
        getData(createQueryString(SKUMasterTypeQuery))
    }, [SKUMasterTypeQuery]);

    async function getData(qryString) {
        const res = await Axios.get(qryString).then(res => res)
        setDataSrc(res.data.datas)
    }

    const UnitTypeQuery = {
        queryString: window.apipath + "/api/mst",
        t: "UnitType",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    const ObjectSizeQuery = {
        queryString: window.apipath + "/api/mst",
        t: "ObjectSize",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const SKUMasterQuery = {
        queryString: window.apipath + "/api/mst",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
console.log(ObjectSizeQuery)
        const colsUnitType = [
            {
                Header: 'ID',
                accessor: 'ID',
                fixed: 'left',
                width: 100,
                sortable: true,
            },
            {
                Header: 'Code',
                accessor: 'Code',
                sortable: true,
            },
          ];
          const colsSKUMaster = [
            {
                Header: 'ID',
                accessor: 'ID',
                fixed: 'left',
                width: 100,
                sortable: true,
            },
            {
                Header: 'Code',
                accessor: 'Code',
                sortable: true,
            },
          ];

    // const columns = [
    //     {"field": "Code","type":"input","name":"Code","placeholder":"xxxxx"},
    //     {"field": "Name","type":"input","name":"Name","placeholder":"xxxxx"},
    //     {"field": "Description", "type":"input","name":"Description","placeholder":"xxxxx"},
    //     {"field": "SKUMaster_ID","type":"input","name":"SKUMaster_ID","placeholder":"xxxxx"},
    //     {"field": "ObjectSize_ID", "type":"input","name":"ObjectSize_ID","placeholder":"xxxxx"},
    //     {"field": "Quantity","type":"input","name":"Quantity","placeholder":"xxxxx"},
    //     {"field": "BaseQuantity","type":"input","name":"BaseQuantity","placeholder":"xxxxx"},        
    //     //{"field": "BaseUnitType_ID","type":"findPopup","colsFindPopup":colsUnitType,"name":"BaseUnitTypeCode","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","labelTitle":"Search of Unit Type","fieldLabel":["ID", "Code"]},   
    //     {"field": "UnitType_ID","type":"dropdow","typeDropdow":"search","name":"UnitType_ID","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","fieldLabel":["ID", "Code"]},   
    //     {"field": "ItemQty","type":"dropdow","typeDropdow":"normal","name":"ItemQty","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","fieldLabel":["ID", "Code"]},   
    //     //{"field": "BaseUnitType_ID","type":"input","Name":"BaseUnitType_ID"},
    // {"field": "ItemQty","type":"dropdow","typeDropdow":"search","name":"ItemQty","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","fieldLabel":["ID", "Code"]},   
    // {"field": "ItemQty","type":"dropdow","typeDropdow":"normal","name":"ItemQty","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","fieldLabel":["ID", "Code"]},   
    //     //{"field": "ItemQty","type":"input","Name":"ItemQty"},
    //     // {"field": "Revision","type":"input","Name":"Revision"},
    //     // {"field": "Status","type":"input","Name":"Status"},
    //     //{"field": "UnitType_ID","type":"input","Name":"UnitType_ID"},  
    // ]

    const columns = [
        //{"field": "SKUMaster_ID","type":"dropdow","typeDropdow":"search","name":"SKU Master","dataDropDow":SKUMasterQuery,"placeholder":"SKU Master","fieldLabel":["ID","Code"]},
        {"field": "SKUMaster_ID","type":"findPopup","colsFindPopup":colsSKUMaster,"name":window.project === "TAP" ? "Part NO." : 'SKU Code',"dataDropDow":SKUMasterQuery,"placeholder":window.project === "TAP" ? "Part NO." : 'SKU Code',"labelTitle":"Search of "+window.project === "TAP" ? "Part NO." : 'SKU Code',"fieldLabel":["ID", "Code"]}, 
        {"field": "Code","type":"inputPackCode","name":"Pack Code","placeholder":"Code"},
        {"field": "Name","type":"inputPackName","name":"Pack Name","placeholder":"Name"},
        {"field": "WeightKG", "type":"input","inputType":"number","name":"Gross Weight","placeholder":"Gross Weight","validate":/^[0-9\.]+$/},
        {"field": "Quantity","type":"input","inputType":"number","name":"Quantity","placeholder":"Quantity","validate":/^[0-9\.]+$/},
        {"field": "UnitType_ID","type":"dropdow","typeDropdow":"search","name":"Unit Type","dataDropDow":UnitTypeQuery,"placeholder":"Unit Type","fieldLabel":["Code"]},
        {"field": "BaseQuantity","type":"input","inputType":"number","name":"Base Quantity","placeholder":"BaseQuantity","validate":/^[0-9\.]+$/},      
        {"field": "BaseUnitType_ID","type":"dropdow","typeDropdow":"search","name":"Base Unit Type","dataDropDow":UnitTypeQuery,"placeholder":"Base Unit Type","fieldLabel":["Code"]},
        {"field": "ItemQty","type":"input","name":"Item Qty","placeholder":"ItemQty","validate":/^[0-9\.]+$/},
        {"field": "ObjectSize_ID","type":"dropdow","typeDropdow":"search","name":"% Weight Verify","dataDropDow":ObjectSizeQuery,"placeholder":"% Weight Verify","fieldLabel":["Code"]},
        
      
    ]

    const columnsEdit = [
        //{"field": "SKUMaster_ID","type":"dropdow","typeDropdow":"search","name":"SKU Master","dataDropDow":SKUMasterQuery,"placeholder":"SKU Master","fieldLabel":["ID","Code"]},
        {"field": "SKUMaster_ID","type":"findPopup","colsFindPopup":colsSKUMaster,"name":window.project === "TAP" ? "Part NO." : 'SKU Code',"dataDropDow":SKUMasterQuery,"placeholder":window.project === "TAP" ? "Part NO." : 'SKU Code',"labelTitle":"Search of "+window.project === "TAP" ? "Part NO." : 'SKU Code',"fieldLabel":["ID", "Code"]}, 
        {"field": "Code","type":"inputPackCode","name":"Pack Code","placeholder":"Code"},
        {"field": "Name","type":"inputPackName","name":"Pack Name","placeholder":"Name"},
        {"field": "WeightKG", "type":"input","inputType":"number","name":"Gross Weight","placeholder":"Gross Weight","validate":/^[0-9\.]+$/},
        {"field": "Quantity","type":"input","inputType":"number","name":"Quantity","placeholder":"Quantity","validate":/^[0-9\.]+$/},
        {"field": "UnitType_ID","type":"dropdow","typeDropdow":"search","name":"Unit Type","dataDropDow":UnitTypeQuery,"placeholder":"Unit Type","fieldLabel":["Code"]},
        {"field": "BaseQuantity","type":"input","inputType":"number","name":"Base Quantity","placeholder":"BaseQuantity","validate":/^[0-9\.]+$/},      
        {"field": "BaseUnitType_ID","type":"dropdow","typeDropdow":"search","name":"Base Unit Type","dataDropDow":UnitTypeQuery,"placeholder":"Base Unit Type","fieldLabel":["Code"]},
        {"field": "ItemQty","type":"input","name":"Item Qty","placeholder":"ItemQty","validate":/^[0-9\.]+$/},
        {"field": "ObjectSize_ID","type":"dropdow","typeDropdow":"search","name":"% Weight Verify","dataDropDow":ObjectSizeQuery,"placeholder":"% Weight Verify","fieldLabel":["Code"]},
        
      
    ]
    const columnsFilter = [
        {"field": "SKUMaster","type":"findPopup","colsFindPopup":colsSKUMaster,"name":window.project === "TAP" ? "Part NO." : 'SKU Code',"dataDropDow":SKUMasterQuery,"placeholder":window.project === "TAP" ? "Part NO." : 'SKU Code',"labelTitle":"Search of "+window.project === "TAP" ? "Part NO." : 'SKU Code',"fieldLabel":["Code"],"fieldDataKey":"Code"}, 
        {"field": "Code","type":"input","name":"Pack Code","placeholder":window.project === "TAP" ? "Part NO." : 'SKU Code'},
        {"field": "Name","type":"input","name":"Pack Name","placeholder":window.project === "TAP" ? "Part Name" : 'SKU Name'},
        {"field": "WeightKG", "type":"input","inputType":"number","name":"Gross Weight","placeholder":"Gross Weight"},
        {"field": "Quantity","type":"input","inputType":"number","name":"Quantity","placeholder":"Quantity"},
        {"field": "UnitTypeCode","type":"dropdow","typeDropdow":"search","name":"Unit Type","dataDropDow":UnitTypeQuery,"placeholder":"Unit Type","fieldLabel":["Code"],"fieldDataKey":"Code"},
        {"field": "BaseQuantity","type":"input","inputType":"number","name":"Base Quantity","placeholder":"BaseQuantity"},       
        {"field": "BaseUnitTypeCode","type":"dropdow","typeDropdow":"search","name":"Base Unit Type","dataDropDow":UnitTypeQuery,"placeholder":"Base Unit Type","fieldLabel":["Code"],"fieldDataKey":"Code"},
        {"field": "ItemQty","type":"input","name":"Item Qty","placeholder":"ItemQty"},
        {"field": "ObjectSizeCode","type":"dropdow","typeDropdow":"search","name":"% Weight Verify","dataDropDow":ObjectSizeQuery,"placeholder":"% Weight Verify","fieldLabel":["Code"],"fieldDataKey":"Code"},
 
    ]
    const iniCols=[
        { Header: window.project === "TAP" ? "Part NO." : 'SKU Code',accessor: 'SKUMaster',fixed: 'left',width:120,sortable:false,},
        { Header: 'Code',accessor: 'Code',fixed: 'left',width:120,sortable:false,},
        { Header: 'Name',accessor: 'Name',width:250,},
        { Header: 'Gross Weight',accessor: 'WeightKG', width:120,},
        { Header: 'Quantity',accessor: 'Quantity', width:100,},
        { Header: 'Unit Type',accessor: 'UnitTypeCode', width:100,},
        { Header: 'Base Quantity',accessor: 'BaseQuantity', width:120,},
        { Header: 'BaseUnitTypeCode',accessor: 'BaseUnitTypeCode', width:140,},
        { Header: 'Item Qty',accessor: 'ItemQty', width:100,},
        { Header: '% Weight Verify',accessor: 'ObjectSizeCode', width:150,},
        { Header: 'Update By',accessor: 'UpdateBy', width:70,},
        { Header: 'Update Time',accessor: 'UpdateTime', width:120,dataType:'datetime',dateFormat:'DD/MM/YYYY HH:mm'},

       
        ];
    // const columnsFilter = [
    //     {"field": "Code","type":"input","name":"Code","placeholder":"xxxxx"},
    //     {"field": "Name","type":"input","name":"Name","placeholder":"xxxxx"},
    //     {"field": "Description", "type":"input","name":"Description","placeholder":"xxxxx"},
    //     {"field": "SKUMaster_ID","type":"input","name":"SKUMaster_ID","placeholder":"xxxxx"},
    //     {"field": "ObjectSize_ID", "type":"input","name":"ObjectSize_ID","placeholder":"xxxxx"},
    //     {"field": "Quantity","type":"input","name":"Quantity","placeholder":"xxxxx"},
    //     //{"field": "BaseQuantity","type":"input","name":"BaseQuantity","placeholder":"xxxxx"},        
    //     {"field": "BaseUnitType_ID","type":"findPopup","colsFindPopup":colsUnitType,"name":"BaseUnitType_ID","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","labelTitle":"Search of Unit Type","fieldLabel":["ID", "Code"]},   
    //     {"field": "UnitType_ID","type":"dropdow","typeDropdow":"search","name":"UnitType_ID","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","fieldLabel":["ID", "Code"]},   
    //     {"field": "ItemQty","type":"dropdow","typeDropdow":"normal","name":"ItemQty","dataDropDow":UnitTypeQuery,"placeholder":"xxxxx","fieldLabel":["ID", "Code"]},   
 
    // ]


   


  
    return (
       <div>
         <MasterData columnsFilter={columnsFilter}  tableQuery={"PackMaster"} table={"ams_PackMaster"} dataAdd={columns} iniCols={iniCols} dataEdit={columnsEdit} /> 
       </div>
          
    )
}


export default TestMaster;
import DocView from "../../views/pageComponent/DocumentView";
import React, { useState, useEffect,useContext  } from "react";
import AmIconStatus from "../../components/AmIconStatus";
import AmStorageObjectStatus from "../../components/AmStorageObjectStatus";
import { Button } from "@material-ui/core";


const Test7 = (props) => {


    const TextHeader = [
        [{"label":"Document No" , "values":"code"},{"label":"Document Date" , "values":"documentDate","type":"date"},],
        [{"label":"" , "values":""},{"label":"Action Time" , "values":"actionTime","type":"dateTime"},],
        [{"label":"Source Branch" , "values":"souBranchName"},{"label":"Source Warehouse" , "values":"souWarehouseName"},],
        [{"label":"SAP.Doc No" , "values":"refID"},{"label":"SAP.Doc Years" , "values":"ref1"},],
        [{"label":"Doc Status" , "values":"renderDocumentStatus()","type":"function"},{"label":"Remark" , "values":"remark"},],
        [{"label":"Option" , "values":"DocType","type":"option"},{"label":"Remark" , "values":"remark"},],
 
     ]

     const columns = [
        {"width": 200,"accessor":"skuMaster_Code", "Header":"SKUCode"},
        {"accessor":"skuMaster_Name", "Header":"SKUName"},
        {"width": 130,"accessor":"batch", "Header":"Batch"},
        {"width": 130,"accessor":"lot", "Header":"Lot"},
        {"width": 130,"accessor":"orderNo", "Header":"Order No"},
        {"width": 120,"accessor":"_qty", "Header":"Qty"},
        {"width": 70,"accessor":"unitType_Name", "Header":"Unit"},
        {"width": 70,"accessor":"palletCode", "Header":"palletCode"},
    ]

    
    const columnsDetailSOU = [
        {"width": 50,"accessor":"status", "Header":"Task","Cell":(e)=>getStatusAD(e.original)},
        {"width": 100,"accessor":"code", "Header":"Pallet"},
        {"width": 150,"accessor":"packCode", "Header":"SKUCode"},
        {"accessor":"packName", "Header":"SKUName"},
        {"width": 125,"accessor":"batch", "Header":"Batch"},
        {"width": 125,"accessor":"lot", "Header":"Lot"},
        {"width": 125,"accessor":"orderNo", "Header":"Order No"},
        {"width": 110,"accessor":"_packQty", "Header":"Qty"},
        {"width": 60,"accessor":"packUnitCode", "Header":"Unit"},
    ]

    const columnsDetailDES = [
        {"width": 50,"accessor":"status", "Header":"Task","Cell":(e)=>getStatusGI(e.original)},
        {"width": 100,"accessor":"code", "Header":"Pallet"},
        {"width": 150,"accessor":"packCode", "Header":"SKUCode"},
        {"accessor":"packName", "Header":"SKUName"},
        {"width": 125,"accessor":"batch", "Header":"Batch"},
        {"width": 125,"accessor":"lot", "Header":"Lot"},
        {"width": 125,"accessor":"orderNo", "Header":"Order No"},
        {"width": 110,"accessor":"_packQty", "Header":"Qty"},
        {"width": 60,"accessor":"packUnitCode", "Header":"Unit"},
    ]

    // const optionDocItems = [
    //     {"optionName": "DocItem"},
    //     {"optionName": "DocType"},
    // ]
        const optionDocItems = [
        {"optionName": "palletCode"},
        {"optionName": "locationCode"},
    ]

    const getStatusGI =(value) => {
        // console.log(value)
        if (value.status === 0)
            return <AmStorageObjectStatus key={17} statusCode={17} />     
        else if (value.status === 1)
            return <AmStorageObjectStatus key={18} statusCode={18} />
        else
          return null
      }

      const getStatusAD =(value) => {
       if (value.status === 0){
         // return <AmIconStatus styleType={"AUDITING"}>AUDITING</AmIconStatus>
        return  <AmStorageObjectStatus key={13} statusCode={13} />
       }
       else if (value.status === 1){
          return <AmStorageObjectStatus key={14} statusCode={14} />     
       }
       else
         return null
     }
      
   //received
   //issued
   //audit
    return (
       <div>
            <DocView 
            openSOU={true} 
            openDES={true} 
            optionDocItems={optionDocItems} 
            columnsDetailSOU={columnsDetailSOU}
            columnsDetailDES={columnsDetailDES}  
            columns={columns}  
            typeDoc={"received"} 
            typeDocNo={1001} 
            docID={"36504"} 
            header={TextHeader}
            //=== back ===
            buttonBack ={true}
            linkBack ={"/"}
            history={props.history}
            //=== end back ===
            />        
       </div>
          
    )
}


export default Test7;
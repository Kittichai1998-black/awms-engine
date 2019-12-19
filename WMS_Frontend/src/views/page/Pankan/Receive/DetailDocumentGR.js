import queryString from 'query-string'
import React from "react";

import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import DocView from "../../../pageComponent/DocumentView";//css

export default (props) => {

    const TextHeader = [
        [
            { label: "Document No", values: "Code" },
            { label: "Document Date", values: "DocumentDate", type: "date" }
        ],
        [            
            { label: "Action Time", values: "ActionTime", type: "dateTime" },
            { label: "Remark", values: "Remark" }
        ],
        [
            { label: "Branch", values: "DesBranchName" },
            { label: "Warehouse", values: "DesWarehouseName" }
         
        ],
        [
            { label: "Customer", values: "DesCustomerName" },
            { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
           
        ]
    ]

    const columns = [
        { "width": 200, "accessor": "SKUMaster_Code", "Header": "SKU Code" },
        { "accessor": "SKUMaster_Name", "Header": "SKU Name" },
        { "width": 120, "accessor": "_qty", "Header": "Qty" },
        { "width": 70, "accessor": "UnitType_Name", "Header": "Unit" }
    ]

    const columnsDetail = [
        { "width": 40, "accessor": "status", "Header": "Task", "Cell": (e) => getStatusGI(e.original) },
        { "width": 140, "accessor": "code", "Header": "Pallet" },
        { "width": 150, "accessor": "packCode", "Header": "SKU Code" },
        { "accessor": "packName", "Header": "SKU Name" },
        { "width": 125, "accessor": "orderNo", "Header": "Order No" },
        { "width": 110, "accessor": "_packQty", "Header": "Qty" },
        { "width": 60, "accessor": "packUnitCode", "Header": "Unit" }
    ]

  
    // const optionDocItems = [
    //     {"optionName": "palletCode"},
    //     {"optionName": "locationCode"},
    // ]

    const getStatusGI = (value) => {
        if (value.status === 0)
            return <AmStorageObjectStatus key={17} statusCode={17} />
        else if (value.status === 1)
            return <AmStorageObjectStatus key={18} statusCode={18} />
        else
            return null
    }

    const getStatusAD = (value) => {
        if (value.status === 0) {
            return <AmStorageObjectStatus key={13} statusCode={13} />
        }
        else if (value.status === 1) {
            return <AmStorageObjectStatus key={14} statusCode={14} />
        }
        else
            return null
    }

    const getDocID = () => {
        const values = queryString.parse(props.location.search)
        var ID = values.docID.toString()
        return ID
    }

    //received
    //issued
    return (
        <DocView
            openSOU={true}
            openDES={false}
            //optionDocItems={optionDocItems} 
            columnsDetailSOU={columnsDetail}
            //columnsDetailDES={columnsDetailDES}
            columns={columns}
            typeDoc={"received"}
            typeDocNo={1001}
            docID={getDocID()}
            header={TextHeader}
            buttonBack={true}
            linkBack={"/receive/search"}
            history={props.history}
        />
    )
}


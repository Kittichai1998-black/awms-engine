import queryString from 'query-string'
import React from "react";

import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import DocView from "../../Pankan/Loading/AmDocumentViewPDFLD";//css

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
            { label: "Branch", values: "SouBranchName" },
            { label: "Warehouse", values: "SouWarehouseName" }
         
        ],
        [
            { label: "Customer", values: "DesCustomerName" },
            { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
           
        ]
    ]

    const columns = [
        { "width": 200, "accessor": "Code", "Header": "Issue Doc" },
        { "accessor": "CreateTime", "Header": "Actiontime" },

    ]

    const columnsDetail = [
        { "width": 150, "accessor": "code", "Header": "Code" },
        { "width": 150, "accessor": "PackMaster_Code", "Header": "Item" },
        { "accessor": "packName", "PackMaster_Name": "Issue Dcument" },
        { "width": 110, "accessor": "packQty", "Header": "Qty" },
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
            typeDoc={"loading"}
            typeDocNo={1012}
            docID={getDocID()}
            header={TextHeader}
            buttonBack={true}
            linkBack={"/loading/search"}
            history={props.history}
        />
    )
}


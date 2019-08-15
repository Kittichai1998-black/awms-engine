import queryString from "query-string";
import React from "react";

import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import DocView from "../../../pageComponent/DocumentView"; //css

export default props => {
    const TextHeader = [
        [
            { label: "Document No", values: "code" },
            { label: "Document Date", values: "documentDate", type: "date" }
        ],
        [
            { label: "Movement Type", values: "movementName" },
            { label: "Action Time", values: "actionTime", type: "dateTime" }
        ],
        [
            { label: "Source Warehouse", values: "souWarehouseName" },
            { label: "Destination Warehouse", values: "desWarehouseName" }
        ],
        [
            { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
            { label: "Remark", values: "remark" }
        ]
    ];

    const columns = [
        { width: 120, accessor: "palletcode", Header: "Pallet Code" },
        { width: 100, accessor: "locationcode", Header: "Location" },
        { width: 200, accessor: "skuMaster_Code", Header: "SKU Code" },
        { accessor: "skuMaster_Name", Header: "SKU Name" },
        { width: 130, accessor: "orderNo", Header: "Order No" },
        { width: 130, accessor: "qtyrandom", Header: "Counting (%)", type: "number" },
        { width: 70, accessor: "unitType_Name", Header: "Unit" }
    ];

    const columnsDetailSOU = [
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusAD(e.original) },
        { width: 130, accessor: "code", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "SKU Code" },
        { accessor: "packName", Header: "SKU Name" },
        { width: 125, accessor: "orderNo", Header: "Order No" },
        { width: 110, accessor: "packQty", Header: "Qty",  type: "number" },
        { width: 60, accessor: "packUnitCode", Header: "Unit" },
        
        // { width: 100, accessor: "code", Header: "Pallet" },
        // { width: 150, accessor: "packCode", Header: "SKU Code" },
        // { accessor: "packName", Header: "SKU Name" },
        // { width: 125, accessor: "orderNo", Header: "Order No" },
        // { width: 110, accessor: "_packQty", Header: "Qty", type: "number" },
        // { width: 60, accessor: "packUnitCode", Header: "Unit" }
    ];

    const columnsDetailDES = [
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGI(e.original) },
        { width: 125, accessor: "code", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "SKU Code" },
        { accessor: "packName", Header: "SKU Name" },
        { width: 125, accessor: "orderNo", Header: "Order No" },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { width: 60, accessor: "packUnitCode", Header: "Unit" }
    ];

    const optionDocItems = [
        { optionName: "palletcode" },
        { optionName: "locationcode" },
        { optionName: "qtyrandom" }
    ];

    const getStatusGI = value => {
        if (value.status === 0)
            return <AmStorageObjectStatus key={17} statusCode={17} />;
        else if (value.status === 1)
            return <AmStorageObjectStatus key={18} statusCode={18} />;
        else return null;
    };

    const getStatusAD = value => {
        if (value.status === 0) {
            return <AmStorageObjectStatus key={13} statusCode={13} />;
        } else if (value.status === 1) {
            return <AmStorageObjectStatus key={14} statusCode={14} />;
        } else return null;
    };

    const getDocID = () => {
        const values = queryString.parse(props.location.search);
        var ID = values.docID.toString();
        return ID;
    };

    //received
    //issued
    return (
        <DocView
            openSOU={true}
            openDES={false}
            optionDocItems={optionDocItems}
            columnsDetailSOU={columnsDetailSOU}
            // columnsDetailDES={columnsDetailDES}
            columns={columns}
            typeDoc={"audit"}
            typeDocNo={2004}
            docID={getDocID()}
            header={TextHeader}
            buttonBack={true}
            linkBack={"/counting/search"}
            history={props.history}
        />
    );
};

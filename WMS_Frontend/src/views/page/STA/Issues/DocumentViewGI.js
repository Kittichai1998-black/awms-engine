import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import queryString from "query-string";

const DocumentViewGI = props => {
    const TextHeader = [
        [
            { label: "Document No", values: "Code" },
            { label: "Document Date", values: "DocumentDate", type: "date" }
        ],
        [
            { label: "Movement Type", values: "MovementName" },
            { label: "Action Time", values: "ActionTime", type: "dateTime" }
        ],
        [
            { label: "Source Warehouse", values: "SouWarehouseName" },
            { label: "Destination Warehouse", values: "DesWarehouseName" }
        ],
        [
            {
                label: "Doc Status",
                values: "renderDocumentStatus()",
                type: "function"
            },
            { label: "Destination Customer", values: "DesCustomerName" }
        ],
        [{}, { label: "Remark", values: "Remark" }]
    ];

    const columns = [
        { width: 120, accessor: "palletcode", Header: "Pallet Code" },
        { width: 200, accessor: "SKUMaster_Code", Header: "Part NO." },
        { accessor: "SKUMaster_Name", Header: "Part Name" },
        { width: 130, accessor: "OrderNo", Header: "OrderNo" },
        { width: 120, accessor: "_qty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Name", Header: "Unit" }
    ];

    const columnsDetailSOU = [
        {
            width: 40,
            accessor: "status",
            Header: "Task",
            Cell: e => getStatusGI(e.original)
        },
        { width: 120, accessor: "Code", Header: "Pallet" },
        { width: 150, accessor: "PackCode", Header: "Part NO." },
        { accessor: "PackName", Header: "Part Name" },
        { width: 100, accessor: "ItemNo", Header: "Item No." },
        { width: 125, accessor: "OrderNo", Header: "OrderNo" },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { width: 60, accessor: "PackUnitCode", Header: "Unit" }
    ];

    const columnsDetailDES = [
        {
            width: 40,
            accessor: "status",
            Header: "Task",
            Cell: e => getStatusGI(e.original)
        },
        { width: 120, accessor: "code", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "Part NO." },
        { accessor: "packName", Header: "Part Name" },
        { width: 100, accessor: "itemNo", Header: "Item No." },
        { width: 125, accessor: "orderNo", Header: "OrderNo" },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { width: 60, accessor: "packUnitCode", Header: "Unit" }
    ];

    const optionDocItems = [
        { optionName: "palletCode" }
        //{"optionName": "locationCode"},
    ];

    const optionSouBstos = [{ optionName: "itemno" }];
    const optionDesBstos = [{ optionName: "itemno" }];
    const getStatusGI = value => {
        //console.log(value)
        if (value.status === 0)
            return <AmStorageObjectStatus key={17} statusCode={17} />;
        else if (value.status === 1)
            return <AmStorageObjectStatus key={18} statusCode={18} />;
        else return null;
    };

    const getStatusAD = value => {
        if (value.status === 0) {
            // return <AmIconStatus styleType={"AUDITING"}>AUDITING</AmIconStatus>
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
        <div>
            <DocView
                openSOU={true}
                openDES={false}
                //optionDocItems={optionDocItems}
                columnsDetailSOU={columnsDetailSOU}
                columnsDetailDES={columnsDetailDES}
                columns={columns}
                typeDoc={"received"}
                typeDocNo={1002}
                docID={getDocID()}
                header={TextHeader}
                buttonBack={true}
                linkBack={"/issue/search"}
                history={props.history}
                optionSouBstos={optionSouBstos}
                optionDesBstos={optionDesBstos}
            />
        </div>
    );
};

export default DocumentViewGI;

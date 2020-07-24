import DocView from "../../../pageComponent/DocumentView";
import React from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";

const GR_Detail = props => {
    const TextHeader = [
        [
            { label: "Document No.", values: "Code" },
            { label: "Document Date", values: "DocumentDate", type: "date" }
        ],
        [
            { label: "Process Type", values: "DocumentProcessTypeName" },
            { label: "Action Time", values: "ActionTime", type: "dateTime" }
        ],
        [
            { label: "Source Warehouse", values: "SouWarehouseName" },
            { label: "Destination Warehouse", values: "DesWarehouseName" }
        ],
        [
            { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
            { label: "Remark", values: "Remark" }
        ]
    ];

    const columns = [
        // { width: 200, accessor: "SKUMaster_Code", Header: "Reorder" },
        { accessor: "SKUMaster_Name", Header: "Item Code" },
        { width: 130, accessor: "OrderNo", Header: "Order No." },
        { width: 120, accessor: "_qty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" }
    ];

    const columnsDetailSOU = [
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
        { width: 100, accessor: "rootCode", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "Pack Code" },
        { accessor: "packName", Header: "Pack Name" },
        { width: 125, accessor: "orderNo", Header: "Order No." },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { width: 60, accessor: "packUnitCode", Header: "Unit" }
    ];

    const columnsDetailDES = [
        //{"width": 40,"accessor":"status", "Header":"Task","Cell":(e)=>getStatusGI(e.original)},
        { width: 100, accessor: "code ", Header: "Pallet" },
        // { width: 150, accessor: "packCode", Header: "Pack Code" },
        // { accessor: "packName", Header: "Pack Name" },
        { Header: "Item Code", accessor: "SKUItems" },
        { width: 125, accessor: "orderNo", Header: "Order No." },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { width: 60, accessor: "packUnitCode", Header: "Unit" }
    ];

    const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

    const getStatusGR = value => {
        if (value.status === 1) return <CheckCircle style={{ color: "green" }} />;
        else if (value.status === 0)
            return <HighlightOff style={{ color: "red" }} />;
        else return null;
    };

    const getDocID = () => {
        const values = queryString.parse(props.location.search);
        var ID = values.docID.toString();
        return ID;
    };

    return (
        <DocView
            openSOU={true}
            openDES={true}
            optionDocItems={optionDocItems}
            columnsDetailSOU={columnsDetailSOU}
            columnsDetailDES={columnsDetailDES}
            CreateputAway={true}
            apiCreate={'/putaway/create?docID='}
            columns={columns}
            typeDoc={"received"}
            typeDocNo={1011}
            docID={getDocID()}
            header={TextHeader}
            buttonBack={true}
            linkBack={"/receive/search"}
            history={props.history}
      
        />
    );
};

export default GR_Detail;

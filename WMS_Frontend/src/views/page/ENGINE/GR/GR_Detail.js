import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";

const GR_Detail = props => {

    const [OwnerGroupType, setOwnerGroupType] = useState(1);
    const [docview, setdocview] = useState();
    const [header, setheader] = useState();

    useEffect(() => {
        if (header !== undefined) {
            setdocview(<DocView
                openSOU={true}
                openDES={false}
                optionDocItems={optionDocItems}
                columnsDetailSOU={columnsDetailSOU}
                //columnsDetailDES={columnsDetailDES}
                OnchageOwnerGroupType={(value) => { setOwnerGroupType(value) }}
                CreateputAway={true}
                apiCreate={'/putaway/create?docID='}
                columns={columns}
                typeDoc={"received"}
                typeDocNo={1011}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/receive/search"}
                history={props.history}
            >
            </DocView>
            )
        }

    }, [header])

    useEffect(() => {
        if (OwnerGroupType !== undefined) {
            console.log(OwnerGroupType)
            var DataprocessType;
            if (OwnerGroupType === 1) {
                DataprocessType = { label: "Source Warehouse", values: "SouWarehouseName" }
            } else if (OwnerGroupType === 2) {
                DataprocessType = { label: "Source Customer", values: "SouCustomerName" }
            } else if (OwnerGroupType === 3) {
                DataprocessType = { label: "Source Supplier", values: "SouSupplierName" }
            } else {
                DataprocessType = { label: "Source Warehouse", values: "SouWarehouseName" }
            }
        }
        var TextHeader = [
            [
                { label: "Document No.", values: "Code" },
                { label: "Document Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", values: "DocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],
            [
                DataprocessType,
                { label: "Destination Warehouse", values: "DesWarehouseName" }
            ],
            [
                { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
                { label: "Remark", values: "Remark" }
            ]
        ];
        setheader(TextHeader)
    }, [OwnerGroupType])


    const columns = [
        { width: 100, accessor: "ItemNo", Header: "Item No." },
        {
            Header: "Item",
            Cell: e => { return e.original.SKUMaster_Code + " : " + e.original.SKUMaster_Name }
        },
        { Header: "OrderNo", accessor: "OrderNo" },
        { Header: "Batch", accessor: "Batch" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 120, accessor: "_qty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Audit Status", accessor: "AuditStatus" },
        { Header: "Vendor Lot", accessor: "Ref1" },
        { Header: "Ref2", accessor: "Ref2" },
        { Header: "Ref3", accessor: "Ref3" },
        { Header: "Ref4", accessor: "Ref4" },
        { Header: "CartonNo", accessor: "CartonNo" },
        { Header: "IncubationDay", accessor: "IncubationDay" },
        { Header: "ProductDate", accessor: "ProductionDate" },
        { Header: "ExpireDate", accessor: "ExpireDate"},
        { Header: "ShelfLifeDay", accessor: "ShelfLifeDay" }
    ];




    const columnsDetailSOU = [
        { width: 100, accessor: "ItemNo", Header: "Item No." },
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
        { width: 100, accessor: "rootCode", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "Pack Code" },
        { accessor: "packName", Header: "Pack Name" },
        { Header: "OrderNo", accessor: "OrderNo" },
        { Header: "Batch", accessor: "Batch" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 120, accessor: "_packQty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Audit Status", accessor: "AuditStatus" },
        { Header: "Vendor Lot", accessor: "Ref1" },
        { Header: "Ref2", accessor: "Ref2" },
        { Header: "Ref3", accessor: "Ref3" },
        { Header: "Ref4", accessor: "Ref4" },
        { Header: "CartonNo", accessor: "CartonNo" },
        { Header: "IncubationDay", accessor: "IncubationDay" },
        { Header: "ProductDate", accessor: "ProductionDate" },
        { Header: "ExpireDate", accessor: "ExpireDate" },
        { Header: "ShelfLifeDay", accessor: "ShelfLifeDay" }
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
        <div>{docview}</div>

    );
};

export default GR_Detail;

import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";
import moment from "moment";

const PK_Detail = props => {

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
                columnsDetailDES={columnsDetailDES}
                OnchageOwnerGroupType={(value) => { setOwnerGroupType(value) }}
                columns={columns}
                typeDoc={"issued"}
                typeDocNo={1002}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/issue/pickingsearch"}
                history={props.history}
                usePrintPDF={true}
                usePickingOnFloor={true}
                columnsPickingonFloor={columnsPickingonFloor}
            >
            </DocView>
            )
        }

    }, [header])

    useEffect(() => {
        if (OwnerGroupType !== undefined) {
            var DataprocessType;
            if (OwnerGroupType === 1) {
                DataprocessType = [{ label: "Source Warehouse", values: "SouWarehouseName" },
                { label: "Destination Warehouse", values: "DesWarehouseName" }]
            } else if (OwnerGroupType === 2) {
                DataprocessType = [{ label: "Source Customer", values: "SouCustomerName" },
                { label: "Destination Customer", values: "DesCustomerName" }]
            } else if (OwnerGroupType === 3) {
                DataprocessType = [{ label: "Source Supplier", values: "SouSupplierName" },
                { label: "Destination Supplier", values: "DesSupplierName" }]
            } else {
                DataprocessType = [{ label: "Source Warehouse", values: "SouWarehouseName" },
                { label: "Destination Warehouse", values: "DesWarehouseName" }]
            }

        }

        var TextHeader = [
            [
                { label: "Document No.", values: "Code" },
                { label: "Document Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process Type", values: "DocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],

            DataprocessType,


            [
                { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
                { label: "Remark", values: "Remark" }
            ]
        ];
        setheader(TextHeader)


    }, [OwnerGroupType])


    const columns = [
        { width: 100, accessor: "ItemNo", Header: "Item No.", widthPDF: 25 },
        {
            Header: "Item",
            Cell: e => { return e.original.SKUMaster_Code + " : " + e.original.SKUMaster_Name },
            CellPDF: e => { return e.SKUMaster_Code + " : " + e.SKUMaster_Name },
            widthPDF: 40
        },
        { Header: "OrderNo", accessor: "OrderNo", widthPDF: 20 },
        { Header: "Batch", accessor: "Batch", widthPDF: 20 },
        { width: 130, accessor: "Lot", Header: "Lot", widthPDF: 25 },
        { width: 120, accessor: "_sumQtyDisto", Header: "Actual Qty", widthPDF: 20 },
        { width: 120, accessor: "Quantity", Header: "Qty", widthPDF: 20 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },
        {
            Header: "Audit Status", accessor: "AuditStatus",
            Cell: e => GetAuditStatus(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 30
        },
        { Header: "Vendor Lot", accessor: "Ref1", widthPDF: 25 },
        { Header: "Ref2", accessor: "Ref2", widthPDF: 20 },
        { Header: "Ref3", accessor: "Ref3", widthPDF: 20 },
        { Header: "Ref4", accessor: "Ref4", widthPDF: 20 },
        { Header: "CartonNo", accessor: "CartonNo", widthPDF: 20 },
        { Header: "IncubationDay", accessor: "IncubationDay", widthPDF: 20 },
        { Header: "ProductDate", accessor: "ProductionDate", widthPDF: 35 },
        { Header: "ExpireDate", accessor: "ExpireDate", widthPDF: 35 },
        { Header: "ShelfLifeDay", accessor: "ShelfLifeDay", widthPDF: 20 }
    ];


    const columnsDetailSOU = [
        { width: 100, accessor: "diItemNo", Header: "Item No.", widthPDF: 10 },
        {
            width: 40, accessor: "status", Header: "Task",
            Cell: e => getStatusGR(e.original), widthPDF: 5,
            CellPDF: value => {
                if (value.status === 1 || value.status === 3) return "Y";
                else if (value.status === 0)
                    return "";
                else return null;
            }
        },
        { width: 100, accessor: "rootCode", Header: "Pallet", widthPDF: 10 },
        { width: 150, accessor: "packCode", Header: "Pack Code", widthPDF: 10 },
        { accessor: "packName", Header: "Pack Name", widthPDF: 20 },
        { Header: "OrderNo", accessor: "diOrderNo", widthPDF: 10 },
        { Header: "Batch", accessor: "diBatch", widthPDF: 10 },
        { width: 130, accessor: "diLot", Header: "Lot", widthPDF: 10 },
        { width: 120, accessor: "_packQty", Header: "Qty", widthPDF: 10 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 10 },
        {
            Header: "Audit Status",
            accessor: "diAuditStatus",
            Cell: e => GetAuditStatus(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 10
        },
        { Header: "Vendor Lot", accessor: "diRef1", widthPDF: 10 },
        { Header: "Ref2", accessor: "diRef2", widthPDF: 10 },
        { Header: "Ref3", accessor: "diRef3", widthPDF: 10 },
        { Header: "Ref4", accessor: "diRef4", widthPDF: 10 },
        { Header: "CartonNo", accessor: "diCartonNo", widthPDF: 10 },
        { Header: "IncubationDay", accessor: "diIncubationDay", widthPDF: 10 },
        {
            Header: "ProductDate", accessor: "diProductionDate",
            Cell: e => getFormatDatePro(e.original), CellPDF: e => getFormatDatePro(e), widthPDF: 15
        },
        {
            Header: "ExpireDate", accessor: "diExpireDate",
            Cell: e => getFormatDateExp(e.original), CellPDF: e => getFormatDateExp(e), widthPDF: 15
        },
        { Header: "ShelfLifeDay", accessor: "diShelfLifeDay", widthPDF: 10 }
    ];

    const getFormatDatePro = (e) => {
        return moment(e.diProductionDate).format("DD/MM/YYYY");
    }

    const getFormatDateExp = (e) => {
        return moment(e.diExpireDate).format("DD/MM/YYYY");
    }
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
    const columnsPickingonFloor = [
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
        { width: 130, Header: "Location", Cell: e => e.original.areaCode + ":" + e.original.areaLocationCode },
        { width: 100, accessor: "rootCode", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "Pack Code" },
        { accessor: "packName", Header: "Pack Name" },
        { width: 125, accessor: "Lot", Header: "Lot" },
        { width: 110, accessor: "distoQtyMax", Header: "Qty" },
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

    const GetAuditStatus = (value) => {
        if (value.AuditStatus === 0 || value.diAuditStatus === 0) {
            return "QUARANTINE"
        } else if (value.AuditStatus === 1 || value.diAuditStatus === 1) {
            return "PASS"
        } else if (value.AuditStatus === 2 || value.diAuditStatus === 2) {
            return "NOTPASS"
        } else if (value.AuditStatus === 9 || value.diAuditStatus === 9) {
            return "HOLD"
        }
    };


    const colListDocItems = [
        { width: 200, accessor: "SKUMaster_Name", Header: "Item Code" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 150, accessor: "Quantity", Header: "จำนวนที่รับเข้าได้" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" }
    ];
    const addPalletMapSTO = {
        apiCreate: '/v2/ScanMapStoFromDocAPI',
        // columnsDocItems: colListDocItems,
        ddlArea: {
            visible: true,
            field: "areaID",
            typeDropdown: "search",
            name: "Area",
            placeholder: "Select Area",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "ID",
            // defaultValue: 15,
            required: true,
            // customQ: "{ 'f': 'AreaMasterType_ID', 'c':'in', 'v': '30'}"
        },
        ddlLocation: {
            visible: true,
            field: "locationID",
            typeDropdown: "search",
            name: "Location",
            placeholder: "Select Location",
            fieldLabel: ["Code", "Name"],
            fieldDataKey: "ID",
            // defaultValue: 14,
            required: false,
            // customQ: "{ 'f': 'AreaMasterType_ID', 'c':'in', 'v': '30'}"
        },
        inputTitle: [
            {
                field: "projCode",
                name: "Project",
                type: "text",
                customShow: (dataDocument) => {
                    return dataDocument.document.Ref1;
                },
            }
        ],
        inputBase:
        {
            visible: true,
            field: "baseCode",
            type: "input",
            name: "Pallet Code",
            placeholder: "Pallet Code",
            maxLength: 10,
            required: true,
            validate: /^.+$/,
        },
        // [
        //   {
        //     field: "baseCode",
        //     placeholder: "Pallet Code",
        //     required: true,
        //     type: "input",
        //     name: "Pallet Code",
        //     maxLength: 10,
        //     validate: /^.+$/,
        //   }
        // ]
    }

    //received
    //issued
    return (
        <div>{docview}</div>

    );
};

export default PK_Detail;

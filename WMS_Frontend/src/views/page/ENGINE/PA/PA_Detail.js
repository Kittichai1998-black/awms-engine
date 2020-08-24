import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";
import moment from "moment";

const PA_Detail = props => {

    const [OwnerGroupType, setOwnerGroupType] = useState(1);
    const [docview, setdocview] = useState();
    const [header, setheader] = useState();



    useEffect(() => {
        if (header !== undefined) {
            setdocview(<DocView
                openSOU={true}
                openDES={true}
                optionDocItems={optionDocItems}
                columnsDetailSOU={columnsDetailSOU}
                columnsDetailDES={columnsDetailDES}
                OnchageOwnerGroupType={(value) => { setOwnerGroupType(value) }}
                columns={columns}
                typeDoc={"received"}
                typeDocNo={1001}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/putaway/search"}
                history={props.history}
                // useAddPalletMapSTO={true}
                // addPalletMapSTO={addPalletMapSTO}
                buttonConfirmMappingSTO={true}
                usePrintBarcodePallet={true}
                usePrintPDF={true}
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
        { width: 120, accessor: "_sumQtyDisto", Header: "Acualt Qty" },
        { width: 120, accessor: "Quantity", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Audit Status", accessor: "AuditStatus", Cell: e => GetAuditStatus(e.original) },
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

    const columnsDetailSOU = [
        { width: 100, accessor: "diItemNo", Header: "Item No." },
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
        { width: 100, accessor: "rootCode", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "Pack Code" },
        { accessor: "packName", Header: "Pack Name" },
        { Header: "OrderNo", accessor: "diOrderNo" },
        { Header: "Batch", accessor: "diBatch" },
        { width: 130, accessor: "diLot", Header: "Lot" },
        { width: 120, accessor: "_packQty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Audit Status", accessor: "diAuditStatus", Cell: e => GetAuditStatus(e.original) },
        { Header: "Vendor Lot", accessor: "diRef1" },
        { Header: "Ref2", accessor: "diRef2" },
        { Header: "Ref3", accessor: "diRef3" },
        { Header: "Ref4", accessor: "diRef4" },
        { Header: "CartonNo", accessor: "diCartonNo" },
        { Header: "IncubationDay", accessor: "diIncubationDay" },
        { Header: "ProductDate", accessor: "diProductionDate", Cell: e => getFormatDatePro(e.original) },
        { Header: "ExpireDate", accessor: "diExpireDate", Cell: e => getFormatDateExp(e.original) },
        { Header: "ShelfLifeDay", accessor: "diShelfLifeDay" }
    ];

    const columnsDetailDES = [
        { width: 125, accessor: "ItemNo", Header: "ItemNo" },
        { width: 100, accessor: "code ", Header: "Pallet" },
        { Header: "Item Code", accessor: "SKUItems" },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { Header: "OrderNo", accessor: "OrderNo" },
        { Header: "Batch", accessor: "Batch" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 120, accessor: "_packQty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" },
        { Header: "Audit Status", accessor: "diAuditStatus", Cell: e => GetAuditStatus(e.original) },
        { Header: "Vendor Lot", accessor: "Ref1" },
        { Header: "Ref2", accessor: "Ref2" },
        { Header: "Ref3", accessor: "Ref3" },
        { Header: "Ref4", accessor: "Ref4" },
        { Header: "CartonNo", accessor: "CartonNo" },
        { Header: "IncubationDay", accessor: "IncubationDay"},
        { Header: "ProductDate", accessor: "ProductionDate"},
        { Header: "ExpireDate", accessor: "ExpireDate" },
        { Header: "ShelfLifeDay", accessor: "ShelfLifeDay" }
    ];

    const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

    const getStatusGR = value => {
        if (value.status === 1 || value.status === 3) return <CheckCircle style={{ color: "green" }} />;
        else if (value.status === 0)
            return <CheckCircleOutlineRoundedIcon style={{ color: "orange" }} />;
        else return null;
    };

    const getFormatDatePro = (e) => {
        return moment(e.diProductionDate).format("DD/MM/YYYY");
    }

    const getFormatDateExp = (e) => {
        return moment(e.diExpireDate).format("DD/MM/YYYY");
    }

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


    const getDocID = () => {
        const values = queryString.parse(props.location.search);
        var ID = values.docID.toString();
        return ID;
    };

    const addPalletMapSTO = {
        // apiCreate: '/v2/ScanMapStoFromDocAPI',
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
        // inputTitle: [
        //     {
        //         field: "projCode",
        //         name: "Project",
        //         type: "text",
        //         customShow: (dataDocument) => {
        //             return dataDocument.document.Ref1;
        //         },
        //     }
        // ],
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

export default PA_Detail;

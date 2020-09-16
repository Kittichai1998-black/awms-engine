import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import HighlightOff from "@material-ui/icons/HighlightOff";
import AmAuditStatus from '../../../../components/AmAuditStatus';
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
                openDES={false}
                optionDocItems={optionDocItems}
                columnsDetailSOU={columnsDetailSOU}
                //columnsDetailDES={columnsDetailDES}
                OnchageOwnerGroupType={(value) => { setOwnerGroupType(value) }}
                columns={columns}
                typeDoc={"received"}
                typeDocNo={1001}
                docID={getDocID()}
                header={header}
                buttonBack={true}
                linkBack={"/receive/putawaysearch"}
                history={props.history}
                // useAddPalletMapSTO={true}
                // addPalletMapSTO={addPalletMapSTO}
                buttonConfirmMappingSTO={true}
                usePrintBarcodePallet={true}
                QrCodemanuak={true}
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
                DataprocessType = { label: "Sou. Warehouse", values: "SouWarehouseName" }
            } else if (OwnerGroupType === 2) {
                DataprocessType = { label: "Sou. Customer", values: "SouCustomerName" }
            } else if (OwnerGroupType === 3) {
                DataprocessType = { label: "Sou. Supplier", values: "SouSupplierName" }
            } else {
                DataprocessType = { label: "Sou. Warehouse", values: "SouWarehouseName" }
            }

        }
        var TextHeader = [
            [
                { label: "Doc No.", values: "Code" },
                { label: "Doc Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", values: "DocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],
            [
                DataprocessType,
                { label: "Des. Warehouse", values: "DesWarehouseName" }
            ],
            [
                { label: "Doc Status", values: "renderDocumentStatusIcon()", type: "function" },
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
        { Header: "Order No.", accessor: "OrderNo", widthPDF: 20 },
        { Header: "Batch", accessor: "Batch", widthPDF: 20 },
        { width: 130, accessor: "Lot", Header: "Lot", widthPDF: 25 },
        { width: 120, accessor: "_sumQtyDisto", Header: "Actual Quantity", widthPDF: 20 },
        { width: 120, accessor: "Quantity", Header: "Quantity", widthPDF: 20 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },
        {
            Header: "Audit Status", accessor: "AuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 30
        },
        { Header: "Vendor Lot", accessor: "Ref1", widthPDF: 25 },
        { Header: "Ref2", accessor: "Ref2", widthPDF: 20 },
        { Header: "Ref3", accessor: "Ref3", widthPDF: 20 },
        { Header: "Ref4", accessor: "Ref4", widthPDF: 20 },
        { Header: "Carton No.", accessor: "CartonNo", widthPDF: 20 },
        { Header: "Incubation Day", accessor: "IncubationDay", widthPDF: 20 },
        { Header: "Product Date", accessor: "ProductionDate", widthPDF: 35 },
        { Header: "Expire Date", accessor: "ExpireDate", widthPDF: 35 },
        { Header: "ShelfLife Day", accessor: "ShelfLifeDay", widthPDF: 20 }
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
        { Header: "Order No.", accessor: "diOrderNo", widthPDF: 10 },
        { Header: "Batch", accessor: "diBatch", widthPDF: 10 },
        { width: 130, accessor: "diLot", Header: "Lot", widthPDF: 10 },
        { width: 120, accessor: "_packQty", Header: "Qty", widthPDF: 10 },
        { width: 70, accessor: "packUnitCode", Header: "Unit", widthPDF: 10 },
        {
            Header: "Audit Status",
            accessor: "diAuditStatus", 
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 10
        },
        { Header: "Vendor Lot", accessor: "diRef1", widthPDF: 10 },
        { Header: "Ref2", accessor: "diRef2", widthPDF: 10 },
        { Header: "Ref3", accessor: "diRef3", widthPDF: 10 },
        { Header: "Ref4", accessor: "diRef4", widthPDF: 10 },
        { Header: "Carton No.", accessor: "diCartonNo", widthPDF: 10 },
        { Header: "Incubation Day", accessor: "diIncubationDay", widthPDF: 10 },
        {
            Header: "Product Date", accessor: "diProductionDate",
            Cell: e => getFormatDatePro(e.original), CellPDF: e => getFormatDatePro(e), widthPDF: 15
        },
        {
            Header: "Expire Date", accessor: "diExpireDate",
            Cell: e => getFormatDateExp(e.original), CellPDF: e => getFormatDateExp(e), widthPDF: 15
        },
        { Header: "ShelfLife Day", accessor: "diShelfLifeDay", widthPDF: 10 }
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
            return "PASSED"
        } else if (value.AuditStatus === 2 || value.diAuditStatus === 2) {
            return "REJECTED"
        } else if (value.AuditStatus === 9 || value.diAuditStatus === 9) {
            return "HOLD"
        }
    };

    const GetAuditStatusIcon = (value) => {
        console.log(value.diAuditStatus)
        if (value.diAuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.diAuditStatus} /></div>
        } else if (value.AuditStatus != undefined) {
            return <div> <AmAuditStatus key={1} statusCode={value.AuditStatus} /></div>
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

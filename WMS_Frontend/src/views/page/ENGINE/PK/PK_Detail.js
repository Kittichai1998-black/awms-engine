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
                usePrintPDF={false}
                usePickingOnFloor={false}
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
                DataprocessType = [{ label: "Sou. Warehouse", value: "SouWarehouse", values: "SouWarehouseName" },
                { label: "Des. Warehouse", value: "DesWarehouse", values: "DesWarehouseName" }]
            } else if (OwnerGroupType === 2) {
                DataprocessType = [{ label: "Sou. Customer", value: "SouCustomer", values: "SouCustomerName" },
                { label: "Des. Customer", value: "DesCustomer", values: "DesCustomerName" }]
            } else if (OwnerGroupType === 3) {
                DataprocessType = [{ label: "Sou. Supplier", value: "SouSupplier", values: "SouSupplierName" },
                { label: "Des. Supplier", value: "DesSupplier", values: "DesSupplierName" }]
            } else {
                DataprocessType = [{ label: "Sou. Warehouse", value: "SouWarehouse", values: "SouWarehouseName" },
                { label: "Des. Warehouse", value: "DesWarehouse", value: "DesWarehouse", values: "DesWarehouseName" }]
            }

        }

        var TextHeader = [
            [
                { label: "Doc No.", values: "Code" },
                { label: "Doc Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process Type", value: "DocumentProcessTypeCode", values: "ReDocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],

            [
                { label: "DO", value: "Ref2" },
                { label: "", value: "", values: "" }
            ],

            DataprocessType,

            [
                { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
                { label: "Remark", values: "_error" , type:"option" }
            ]
        ];
        setheader(TextHeader)


    }, [OwnerGroupType])


    const columns = [
        //{ width: 100, accessor: "ItemNo", Header: "Item No.", widthPDF: 25 },
        {
          width:120, accessor: "Ref4" ,Header: "Customers"
        },
        
        {
            Header: "SKU Code",
            Cell: e => { return e.original.SKUMaster_Code },
            CellPDF: e => { return e.SKUMaster_Code },
            widthPDF: 40
        },
        { Header: "Grade", accessor: "Ref1", widthPDF: 25 },
        { width: 130, accessor: "Lot", Header: "Lot", widthPDF: 25 },
        { width: 130, accessor: "Ref3", Header: "UD", widthPDF: 25 },
        { width: 120, accessor: "_sumQtyDisto", Header: "Pick QTY", widthPDF: 20 },
        { width: 120, accessor: "Quantity", Header: "Total QTY", widthPDF: 20 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },

    ];


    const columnsDetailSOU = [
        //{ width: 100, accessor: "diItemNo", Header: "Item No.", widthPDF: 10 },
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
        { Header: "Label", accessor: "itemNo", width: 130, widthPDF: 25,Cell:e=>(e.original.itemNo??"").replace(/ /g,"\xa0") },
        { Header: "Sku", accessor: "packCode", widthPDF: 10, width: 150  },
        { Header: "Quantity", accessor: "distoQty", widthPDF: 10, width: 120 },
        { Header: "Unit", accessor: "distoUnitCode", widthPDF: 10, width: 70, },
        //{ Header: "Location", accessor: "areaLocationCode", widthPDF: 10, width: 70, },
        { Header: "Pallet No.", width: 100, accessor: "rootCode", widthPDF: 10 },
        { Header: "Location", width: 100, accessor: "areaLocationCode", widthPDF: 10,Cell:e=>(e.original.areaLocationCode).split("(")[0]}
        // Cell:e=>queryString.parse(e.original.options).pa_loc 
    ];

    const getFormatDatePro = (e) => {
        if (e.diProductionDate) {
            return moment(e.diProductionDate).format("DD/MM/YYYY");
        }

    }

    const getFormatDateExp = (e) => {
        if (e.diExpireDate) {
            return moment(e.diExpireDate).format("DD/MM/YYYY");
        }
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
        if (value.status === 0)
            return <></>;
        else if (value.status === 1)
            return <CheckCircleOutlineRoundedIcon style={{ color: "orange" }} />;
        else if (value.status === 3)
            return <CheckCircleOutlineRoundedIcon style={{ color: "green" }} />;
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

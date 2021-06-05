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
                usePrintBarcodePallet={false}
                QrCodemanuak={true}
                usePrintPDF={false}
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
                DataprocessType = { label: "Sou. Warehouse", value: "SouWarehouse", values: "SouWarehouseName" }
            } else if (OwnerGroupType === 2) {
                DataprocessType = { label: "Sou. Customer", value: "SouCustomer", values: "SouCustomerName" }
            } else if (OwnerGroupType === 3) {
                DataprocessType = { label: "Sou. Supplier", value: "SouSupplier", values: "SouSupplierName" }
            } else {
                DataprocessType = { label: "Sou. Warehouse", value: "SouWarehouse", values: "SouWarehouseName" }
            }

        }
        var TextHeader = [
            [
                { label: "Putaway No.", values: "Code" },
                { label: "Doc. Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", value: "DocumentProcessTypeCode", values: "ReDocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],

            [
                { label: "BO", value: "Ref2" },
                { label: "Des. Warehouse", value: "DesWarehouse", values: "DesWarehouseName" }
            ],
            [
                { label: "Doc Status", values: "renderDocumentStatusIcon()", type: "function" },
                { label: "Booking", values:"_book_bay_lv",  type:"option" }
            ]
        ];
        setheader(TextHeader)


    }, [OwnerGroupType])


    const columns = [
        //{ width: 100, accessor: "ItemNo", Header: "Item No.", widthPDF: 25 }, 
        { Header: "Label", accessor: "ItemNo", width: 130, widthPDF: 25,Cell:e=>(e.original.ItemNo??"").replace(/ /g,"\xa0") },
        { Header: "Customer", accessor: "Ref4", width: 130, widthPDF: 25 },  
        {
            Header: "Sku",
            Cell: e => { return e.original.SKUMaster_Code },
            CellPDF: e => { return e.SKUMaster_Code }, widthPDF: 40
        },
        { Header: "Grade", accessor: "Ref1", widthPDF: 25 },
        { Header: "Lot", accessor: "Lot", width: 130, widthPDF: 25 },
        { Header: "No", accessor: "Ref2", widthPDF: 25 },
        { Header: "UD", accessor: "Ref3", widthPDF: 25 },
        { width: 120, accessor: "_sumQtyDisto", Header: "Receive QTY", widthPDF: 20 },
        { width: 120, accessor: "Total QTY", Header: "Quantity", widthPDF: 20 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },
        

    ];


    const columnsDetailSOU = [
        {
            Header: "Task", accessor: "status", width: 40, Cell: e => getStatusGR(e.original),
            widthPDF: 5,
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

    ];

    const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }, { optionName:"_book_bay_lv"}];

    const getStatusGR = value => {
        if (value.status === 0)
            return <></>;
        else if (value.status === 1)
            return <CheckCircleOutlineRoundedIcon style={{ color: "orange" }} />;
        else if (value.status === 3)
            return <CheckCircleOutlineRoundedIcon style={{ color: "green" }} />;
        else return null;
    };


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

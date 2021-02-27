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
import { AuditStatusVal } from "../../../../components/Models/AuditStatus";
import _ from 'lodash';

const PA_Detail = props => {

    const [OwnerGroupType, setOwnerGroupType] = useState(1);

    const [header, setheader] = useState([]);



    useEffect(() => {

        var TextHeader = [
            [
                { label: "Doc No.", values: "Code" },
                { label: "Doc Date", values: "DocumentDate", type: "date" }
            ],
            [
                { label: "Process No.", value: "DocumentProcessTypeCode", values: "ReDocumentProcessTypeName" },
                { label: "Action Time", values: "ActionTime", type: "dateTime" }
            ],
            // [
            //     { label: "PO NO.", values: "Ref1" }
            // ],
            [
                { label: "Des Area", value: "DesAreaMasterCode", values: "DesAreaMasterName" },
                { label: "Des. Warehouse", value: "DesWarehouse", values: "DesWarehouseName" }
            ],
            [
                { label: "Doc Status", getStatusText: "renderDocumentStatus()", values: "renderDocumentStatusIcon()", type: "function" },
                { label: "Remark", values: "Remark" }
            ]
        ];
        setheader(TextHeader)


    }, [OwnerGroupType])


    const columns = [
        {
            Header: "Item Code",
            Cell: e => { return e.original.SKUMaster_Code },
            CellPDF: e => { return e.SKUMaster_Code },
            widthPDF: 40
        },
        {
            Header: "Item Name",
            Cell: e => { return e.original.SKUMaster_Name },
            CellPDF: e => { return e.SKUMaster_Name },
            widthPDF: 40
        },
        { Header: "Order No.", accessor: "OrderNo", widthPDF: 20 },
        { width: 130, accessor: "Lot", Header: "Lot", widthPDF: 25 },
        { Header: "Batch", accessor: "Ref1", widthPDF: 25 },
        { width: 120, accessor: "_sumQtyDisto", Header: "Receive Quantity", widthPDF: 20 },
        { width: 120, accessor: "Quantity", Header: "Request Quantity", widthPDF: 20 },
        { width: 70, accessor: "UnitType_Code", Header: "Unit", widthPDF: 20 },
        {
            Header: "Quality Status", accessor: "AuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 30
        },
        { Header: "Remark", accessor: "remark", widthPDF: 20 },
        { Header: "Carton No.", accessor: "CartonNo", widthPDF: 20 },
        { Header: "MFG.Date", accessor: "ProductionDate", widthPDF: 35 },
        { Header: "Expire Date", accessor: "ExpireDate", widthPDF: 35 }
    ];

    const columnsDetailSOU = [
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
        { Header: "Pallet", accessor: "rootCode", widthPDF: 10, width: 100, },
        { Header: "Pack Code", accessor: "packCode", widthPDF: 10, width: 150 },
        { Header: "Pack Name", accessor: "packName", widthPDF: 20 },
        { Header: "Order No.", accessor: "diOrderNo", widthPDF: 10 },
        { Header: "Lot", accessor: "diLot", width: 130, widthPDF: 10 },
        { Header: "Batch", accessor: "diRef1", widthPDF: 10 },
        { Header: "Actual Quantity", accessor: "distoQty", widthPDF: 10, width: 120 },
        //{ Header: "Quantity Per Pallet", accessor: "distoQtyMax", widthPDF: 10, width: 120 },
        { Header: "Unit", accessor: "packUnitCode", widthPDF: 10, width: 70 },
        {
            Header: "Quality Status",
            accessor: "diAuditStatus",
            Cell: e => GetAuditStatusIcon(e.original),
            CellPDF: e => GetAuditStatus(e),
            widthPDF: 10
        },
        { Header: "Remark", accessor: "remark", widthPDF: 10 },
        { Header: "Carton No.", accessor: "diCartonNo", widthPDF: 10 },
        {
            Header: "MFG.Date", accessor: "diProductionDate",
            Cell: e => getFormatDatePro(e.original), CellPDF: e => getFormatDatePro(e), widthPDF: 15
        },
        {
            Header: "Expire Date", accessor: "diExpireDate",
            Cell: e => getFormatDateExp(e.original), CellPDF: e => getFormatDateExp(e), widthPDF: 15
        }
    ];

    const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

    const getStatusGR = value => {
        if (value.status === 0)
            return <CheckCircleOutlineRoundedIcon style={{ color: "gray" }} />;
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
        if(value.diAuditStatus || value.AuditStatus){
            var _statustxt = _.result(_.find(AuditStatusVal, function (obj) {
                return obj.value === value.diAuditStatus || obj.value === value.AuditStatus;
            }), 'label');
            return _statustxt;
        }else{
            return "-";
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
    return (<DocView
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
        //buttonConfirmMappingSTO={true}
        //usePrintBarcodePallet={true}
        //QrCodemanuak={true}
        usePrintPDF={true}
    />
    );
};

export default PA_Detail;

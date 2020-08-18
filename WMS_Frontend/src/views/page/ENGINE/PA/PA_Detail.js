import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect } from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";

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
        console.log(DataprocessType)
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
        { width: 120, accessor: "_qty", Header: "Qty" },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" }
    ];

    const columnsDetailSOU = [
        { width: 100, accessor: "ItemNo", Header: "Item No." },
        { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
        {
            width: 130, Header: "Location",
            Cell: e => {
                let location = e.original.areaLocationCode ? ":" + e.original.areaLocationCode : "";
                return e.original.areaCode + location;
            }
        },
        { width: 100, accessor: "rootCode", Header: "Pallet" },
        { width: 150, accessor: "packCode", Header: "Pack Code" },
        { accessor: "packName", Header: "Pack Name" },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { width: 60, accessor: "packUnitCode", Header: "Unit" }
    ];

    const columnsDetailDES = [
        //{"width": 40,"accessor":"status", "Header":"Task","Cell":(e)=>getStatusGI(e.original)},
        { width: 100, accessor: "code ", Header: "Pallet" },
        // { width: 150, accessor: "packCode", Header: "Pack Code" },
        // { accessor: "packName", Header: "Pack Name" },
        { Header: "Item Code", accessor: "SKUItems" },
        { width: 125, accessor: "ItemNo", Header: "ItemNo" },
        { width: 110, accessor: "_packQty", Header: "Qty" },
        { width: 60, accessor: "packUnitCode", Header: "Unit" }
    ];

    const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

    const getStatusGR = value => {
        if (value.status === 1 || value.status === 3) return <CheckCircle style={{ color: "green" }} />;
        else if (value.status === 0)
            return <HighlightOff style={{ color: "red" }} />;
        else return null;
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

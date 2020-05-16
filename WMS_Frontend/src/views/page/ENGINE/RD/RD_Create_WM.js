import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const RD_Create_WM = props => {
    const [dataWarehouse, setDataWarehouse] = useState("");
    const [dataMovementTypeCUS, setDataMovementTypeCUS] = useState("");
    const [table, setTable] = useState(null);

    useEffect(() => {
        Axios.get(createQueryString(MovementTypeQuery2)).then(res => {
            if (res.data.datas) {
                setDataMovementTypeCUS(res.data.datas[0].Name);
            }
        });
    }, []);

    useEffect(() => {
        // getURL()
        if (dataMovementTypeCUS !== "") {
            var headerCreate = [
                [
                    { label: "Document No.", type: "labeltext", key: "", texts: "-", codeTranslate: "Document No." },
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "FG_TRANSFER_WM", valueTexts: "1011", codeTranslate: "Movement Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: "", valueTexts: 1, codeTranslate: "Source Warehouse" },
                    { label: "Destination Customer", type: "dropdown", key: "desCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Destination Customer" }
                ],
                [
                    { label: "For Customer", type: "dropdown", key: "forCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "For Customer" },
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                ],
                [

                    { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
                ]
               
            ];

            if (headerCreate.length > 0) {
                setTable(
                    <AmCreateDocument
                        addList={addList}
                        headerCreate={headerCreate}
                        columns={columns}
                        columnEdit={columnEdit}
                        apicreate={apicreate}
                        createDocType={"receiveOrder"}
                        history={props.history}
                        apiRes={apiRes}
                  />
                );
            }
        }
    }, [dataMovementTypeCUS]);


    const columsFindPopupSKU = [
        { Header: "Code", accessor: "Code", fixed: "left", width: 100, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
        { Header: "Unit", accessor: "UnitTypeCode", width: 100 }
    ];


    const columsFindpopUpPALC = [
        {
            Header: "Pallet Code",
            accessor: "palletcode",
            width: 110,
            style: { textAlign: "center" }
        },
       
        {
            Header: "SI",
            accessor: "orderNo",
            width: 70,
            style: { textAlign: "center" }
        },
        { Header: "Reorder/Brand", accessor: "SKUItems" },
        {
            Header: "Size",
            accessor: "Size",
            width: 50
        },
        {
            Header: "Carton No",
            accessor: "Carton",
            width: 100,
            Cell: e => getCarton(e.original)
        },
        // { Header: "SKU Code", accessor: 'Code', width: 110 },
        // { Header: "SKU Name", accessor: 'Name', width: 170 },
        {
            Header: "Location",
            accessor: "LocationCode",
            width: 90,
            style: { textAlign: "center" }
        },
        // { Header: 'Batch', accessor: 'Batch', width: 100,  style: { textAlign: "center" }  },
        // { Header: 'Batch', accessor: 'Batch' },

        {
            Header: "Quantity",
            accessor: "Quantity",
            width: 90,
            style: { textAlign: "center" }
        },
        {
            Header: "Unit",
            accessor: "BaseUnitCode",
            width: 70,
            style: { textAlign: "center" }
        },
        // { Header: 'Shelf Day', accessor: 'ShelfDay', width: 95 },
        {
            Header: "Remark",
            accessor: "remark",
            width: 110,
            style: { textAlign: "center" }
        }
    ];

    const getCarton = value => {
        var qryStr = queryString.parse(value.Options);
        return qryStr["carton_no"];
    };
    const PalletCode = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "PalletSto",
        q:
            '[{"f":"Status" , "c":"=" , "v":"1"},{"f": "EventStatus" , "c":"in" , "v": "12,97"},{"f": "GroupType" , "c":"=" , "v": "1"}]', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
        f:
            "ID,palletcode,Code,Batch,Name,Quantity,UnitCode,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine,OrderNo as orderNo,Remark as remark,Size,Options",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 20,
        all: ""
    };

    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q:
            '[{ "f": "Status", "c":"<", "v": 2}]',
        f:
            "ID,Code,Name,UnitTypeCode,ID as SKUID,concat(Code, ' : ' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const WarehouseQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const addList = {
        queryApi: PalletCode,
        columns: columsFindpopUpPALC,
        search: [
            {
                accessor: "palletcode",
                placeholder: "Pallet Code"
            },
            {
                accessor: "orderNo",
                placeholder: "SI"
            },
            { accessor: "Code", placeholder: "Reorder" },
            { accessor: "Size", placeholder: "Size" },
            { accessor: "LocationCode", placeholder: "Location" },
            { accessor: "remark", placeholder: "Remark" }
        ]
    };

    const getStatusGI = value => {
        console.log(value);
    };
    const CustomerQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const MovementTypeQuery2 = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "DocumentProcessType",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v":1011}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const columsFindpopUp = [
        {
            Header: "Reorder",
            accessor: "Code",
            fixed: "left",
            width: 130,
            sortable: true
        },
        { Header: "Brand", accessor: "Name", width: 200, sortable: true }
    ];

    const columnEdit = [
        { Header: "Item Code", accessor: "SKUItems", type: "findPopUp", pair: "skuCode", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["SKUItems"], columsddl: columsFindPopupSKU, codeTranslate: "Item Code", required: true },
        { Header: "Pallet", accessor: "palletcode", type: "findPopUp", idddl: "palletcode", queryApi: PalletCode, fieldLabel: ["palletcode"], columsddl: columsFindpopUp, codeTranslate: "Pallet" },
        { Header: "Batch", accessor: "batch", type: "input", codeTranslate: "Batch" },
        { Header: "Lot", accessor: "lot", type: "input", codeTranslate: "Lot" },
        { Header: "Order No.", accessor: "orderNo", type: "input", codeTranslate: "Order No." },
        { Header: "Quantity", accessor: "quantity", type: "inputNum", codeTranslate: "Quantity" },
        { Header: "Unit", accessor: "unitType", type: "text", codeTranslate: "Unit" }
    ];


    const columns = [
        { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Item Code", accessor: "SKUItems" },
        { Header: "Pallet", accessor: "palletcode", width: 110 },
        { Header: "Batch", accessor: "batch", width: 100 },
        { Header: "Lot", accessor: "lot", width: 100 },
        { Header: "Order No.", accessor: "orderNo", width: 100 },
        { Header: "Qty", accessor: "quantity", width: 110 },
        { Header: "Unit", accessor: "unitType", width: 90 }
    ];

    const apicreate = "/v2/CreateGIDocAPI/"; //API ���ҧ Doc
    const apiRes = "/receiveOrder/detail?docID="; //path ˹����������´ �͹����ѧ����Դ

    return <div>
        {table}</div>;
};

export default RD_Create_WM;

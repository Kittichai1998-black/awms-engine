import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const RD_Create_FGCustomer = props => {
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
                    { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "FG_TRANSFER_CUS", valueTexts: "1012", codeTranslate: "Movement Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "Source Warehouse", type: "dropdown", key: "sourceWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" },
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
                        //addList={addList}
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
            "ID,palletcode,Code,Batch,Name,Quantity,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine,OrderNo as orderNo,Remark as remark,Size,Options",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 20,
        all: ""
    };

    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "SKUMasterType_ID", "c":"!=", "v": 50}]',
        f: "ID as skuID,Code as skuCode,Name as skuName,UnitTypeCode as unitType,concat(Code, ' : ' ,Name) as SKUItems",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const WarehouseQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
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
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v":1012}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const columsFindPopupSKU = [
        { Header: "Code", accessor: "skuCode", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "skuName", width: 250, sortable: true },
        { Header: "Unit", accessor: "unitType", width: 50 }
    ];

    const columnEdit = [
        { Header: "Order No.", accessor: "orderNo", type: "input" },
        {
            // search: false,
            Header: "SKU Item",
            accessor: "skuCode",
            type: "findPopUp",
            queryApi: SKUMaster,
            fieldLabel: ["skuCode", "skuName"],
            columsddl: columsFindPopupSKU,
            related: ["unitType", "skuName", "SKUItems"],
            fieldDataKey: "Code", // ref กับ accessor
            defaultValue: "PJAAN04-0024",
            required: true
        },
        { Header: "Quantity", accessor: "quantity", type: "inputNum", required: true },
        { Header: "Unit", accessor: "unitType", type: "text" }
    ];

    const columns = [
        // { id: "row", Cell: row => row.index + 1, width: 35 },
        { Header: "Order No.", accessor: "orderNo", width: 100 },
        { Header: "Item Code", accessor: "SKUItems" },
        { Header: "Qty", accessor: "quantity", width: 110 },
        { Header: "Unit", accessor: "unitType", width: 90 }
    ];

    const apicreate = "/v2/CreateDRDocAPI/"; //API สร้าง Doc
    const apiRes = "/receiveOrder/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        {table}</div>;
};

export default RD_Create_FGCustomer;

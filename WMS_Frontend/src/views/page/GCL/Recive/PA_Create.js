import React, { useState, useEffect } from "react";

import AmputAndpick from "../../../pageComponent/AmCreateDocPutandPick/AmputAndpick";
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const Create_GR_DR = props => {
    const [dataMovementTypeCUS, setDataMovementTypeCUS] = useState("");
    const [table, setTable] = useState(null);
    const [dataDocument, setdataDocument] = useState();


    useEffect(() => {
        var headerCreate = []
        if (dataDocument === undefined) {
            headerCreate = [

                [
                    { label: "Doc NO.", type: "findPopUpDoccan", key: "ID", fieldLabel: ["Code"], codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Doc Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: "", valueTexts: "", codeTranslate: "Document ProcessType" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "PO NO.", type: "labeltext", key: "Ref1", valueTexts: "", codeTranslate: "PO NO." },
                ],
                [
                    { label: "Sou. Warehouse", type: "labeltext", key: "souWarehouseID", valueTexts: "", codeTranslate: "Source Warehouse" },
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", valueTexts: "", codeTranslate: "Des Warehouse" }
                ],
                [

                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "Remark", codeTranslate: "Remark" }
                ]

            ];

        } else {
            let DocumentProcessTypeName = dataDocument.ReDocumentProcessTypeName
            let DocumentProcessType_ID = dataDocument.DocumentProcessType_ID
            let SouCustomerName = dataDocument.SouCustomerName
            let Sou_Customer_ID = dataDocument.Sou_Customer_ID
            let SouWarehouseName = dataDocument.SouWarehouseName
            let Sou_Warehouse_ID = dataDocument.Sou_Warehouse_ID
            let SouSupplierName = dataDocument.SouSupplierName
            let Sou_Supplier_ID = dataDocument.Sou_Supplier_ID
            let DesWarehouseName = dataDocument.DesWarehouseName
            let Des_Warehouse_ID = dataDocument.Des_Warehouse_ID
            let ForCustomerName = dataDocument.ForCustomerName
            let Ref1 = dataDocument.Ref1
            let For_Customer_ID = dataDocument.For_Customer_ID
            let Source;
            if (SouWarehouseName != null) {
                Source = { label: "Sou. Warehouse", type: "labeltext", key: "souWarehouseID", texts: SouWarehouseName, valueTexts: Sou_Warehouse_ID, codeTranslate: "Source Warehouse" }
            } else if (SouCustomerName != null) {
                Source = { label: "Sou. Customer", type: "labeltext", key: "souCustomerID", texts: SouCustomerName, valueTexts: Sou_Customer_ID, codeTranslate: "Source Customer" }
            } else if (SouSupplierName != null) {
                Source = { label: "Sou. Supplier", type: "labeltext", key: "souSupplierID", texts: SouSupplierName, valueTexts: Sou_Supplier_ID, codeTranslate: "Source Supplier" }

            } else {
                Source = { label: "Sou. Warehouse", type: "labeltext", key: "souWarehouseID", texts: '', valueTexts: '', codeTranslate: "Source Warehouse" }
            }

            headerCreate = [

                [
                    { label: "Doc NO.", type: "findPopUpDoccan", key: "ID", fieldLabel: ["Code"], codeTranslate: "Doc Delivery", cols: columsDoc },
                    //{ label: "Doc Delivery", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: DocumentProcessTypeName, valueTexts: DocumentProcessType_ID, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "PO NO.", type: "labeltext", texts: Ref1, valueTexts: Ref1, codeTranslate: "PO NO.", key: "ref1", }
                ],
                [
                    Source,
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", texts: DesWarehouseName, valueTexts: Des_Warehouse_ID, codeTranslate: "Des Warehouse" }
                ],
                [
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark" }
                ],



            ];

        }


        if (headerCreate.length > 0) {
            setTable(
                <AmputAndpick
                    //addList={addList}
                    docheaderCreate={headerCreate}
                    doccolumns={columns}
                    doccolumnEdit={columnEdit}
                    docapicreate={apicreate}
                    doccreateDocType={"putAway"}
                    doctypeDocNo={1011}
                    dochistory={props.history}
                    onChangeDoument={(e) => { setdataDocument(e) }}
                    docItemQuery={DocumentItem}
                    doccolumnEditItem={columnEditItem}
                    doccolumnEditItemSet={columnEditItemSet}
                    docapiRes={apiRes}
                />
            );
        }

    }, [dataDocument]);

    const columsDoc = [
        { Header: "Code", accessor: "Code" }
    ]




    const getCarton = value => {
        var qryStr = queryString.parse(value.Options);
        return qryStr["carton_no"];
    };
    const PalletCode = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "PalletSto",
        q:
            '[{"f":"Status" , "c":"=" , "v":"1"},{"f": "EventStatus" , "c":"in" , "v": "12,97"},{"f": "GroupType" , "c":"=" , "v": "1"}]', //?????????????? '[{ "f": "Status", "c":"<", "v": 2}]'
        f:
            "ID,palletcode,Code,Batch,Name,Quantity,UnitCode,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine,OrderNo as orderNo,Remark as remark,Size,Options",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 20,
        all: ""
    };


    const DocumentDR = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1011},{ "f": "Code", "c":"!=", "v": 8011}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'DESC'}]",
        sk: 0,
        l: 100,
        all: ""

    }

    const DocumentItem = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "DocumentItem",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""

    }


    const columnEdit = [
        { Header: "Item Code", accessor: "Code" },
        { Header: "Item Name", accessor: "Name", width: 200 },
        { Header: "Lot", accessor: "lot" },
        { Header: "Quantity", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        { Header: "Quantity/Pallet", accessor: "options" },
        { Header: "Start Pallet", accessor: "options" },
        { Header: "End Pallet", accessor: "options" },
        { Header: "Remark", accessor: "remark" },

    ];

    const columnEditItem = [
        { Header: "Item Code", accessor: "Code" },
        { Header: "Item Name", accessor: "Name", width: 200 },
        { Header: "Lot", accessor: "lot" },
        { Header: "Quantity", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        { Header: "Quantity/Pallet", accessor: "options" },
        { Header: "Start Pallet", accessor: "options" },
        { Header: "End Pallet", accessor: "options" },
        { Header: "Remark", accessor: "remark" },

    ];


    const columnEditItemSet = [
        { Header: "Item Code", accessor: "Code" },
        { Header: "Item Name", accessor: "Name", width: 200 },
        { Header: "Lot", accessor: "lot" },

    ];


    const columns = [
        { Header: "Item Code", accessor: "Code" },
        { Header: "Item Name", accessor: "Name", width: 200 },
        { Header: "Lot", accessor: "lot" },
        { Header: "Quantity", accessor: "quantity" },
        { Header: "Unit", accessor: "unitType" },
        { Header: "Quantity/Pallet", accessor: "options" },
        { Header: "Start Pallet", accessor: "options" },
        { Header: "End Pallet", accessor: "options" },
        { Header: "Remark", accessor: "remark" },
    ];

    const apicreate = "/v2/CreateGRDocAPI/"; //API ??????????? Doc
    const apiRes = "/receive/putawaydetail?docID="; //path ?????????????????????????????????? ?????????????????????????????????

    return <div>
        {table}</div>;
};

export default Create_GR_DR;

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
                    { label: "Doc NO.", type: "findPopUpDoc", key: "ID", queryApi: DocumentDR, fieldLabel: ["Code"], defaultValue: 1, codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Doc. Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: "", valueTexts: "", codeTranslate: "Document ProcessType" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "Product Owner", type: "labeltext", key: "productOwnerID", texts: "", valueTexts: "", codeTranslate: "ProductOwner" },
                    { label: "Des Area", type: "labeltext", key: "desAreaMasterID", texts: "", valueTexts: "", codeTranslate: "DesAreaMaster" },

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
            let ProductOwner_ID = dataDocument.ProductOwner_ID
            let Des_AreaMaster_ID = dataDocument.Des_AreaMaster_ID
            let ProductOwnerCode = dataDocument.ProductOwnerCode
            let DesAreaMasterName = dataDocument.DesAreaMasterName
            let ForCustomerName = dataDocument.ForCustomerName

            let Ref1 = dataDocument.Ref1
            let For_Customer_ID = dataDocument.For_Customer_ID


            headerCreate = [

                [
                    { label: "Doc NO.", type: "findPopUpDoccan", key: "ID", fieldLabel: ["Code"], codeTranslate: "Doc Delivery", cols: columsDoc },
                    { label: "Document Date", type: "date", key: "documentDate", codeTranslate: "Document Date" }
                ],
                [
                    { label: "Process No.", type: "labeltext", key: "documentProcessTypeID", texts: DocumentProcessTypeName, valueTexts: DocumentProcessType_ID, codeTranslate: "Process Type" },
                    { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time" }
                ],
                [
                    { label: "ProductOwner", type: "labeltext", key: "productOwnerID", texts: ProductOwnerCode, valueTexts: ProductOwner_ID, codeTranslate: "ProductOwner" },
                    { label: "Des. Area", type: "labeltext", key: "desAreaMasterID", texts: DesAreaMasterName, valueTexts: Des_AreaMaster_ID, codeTranslate: "DesAreaMaster" },
                ],
                [
                    { label: "Sou. Warehouse", type: "labeltext", key: "souWarehouseID", texts: SouWarehouseName, valueTexts: Sou_Warehouse_ID, codeTranslate: "Source Warehouse" },
                    { label: "Des. Warehouse", type: "labeltext", key: "desWarehouseID", texts: DesWarehouseName, valueTexts: Des_Warehouse_ID, codeTranslate: "Des Warehouse" }
                ],
                [
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                    { label: "Remark", type: "input", key: "Remark", codeTranslate: "Remark" }
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
            '[{"f":"Status" , "c":"=" , "v":"1"},{"f": "EventStatus" , "c":"in" , "v": "12,97"},{"f": "GroupType" , "c":"=" , "v": "1"}]', //���͹� '[{ "f": "Status", "c":"<", "v": 2}]'
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
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1011}]',
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
        { Header: "เลขที่ภาชนะ", accessor: "BaseCode", codeTranslate: "Base Code", type: "text" },
        { Header: "ชนิดราคา", accessor: "Code", codeTranslate: "Code", type: "text" },
        { Header: "แบบ", accessor: "Ref2", codeTranslate: "Ref2", type: "text" },
        { Header: "ประเภทธนบัตร", accessor: "Ref3", codeTranslate: "Ref3", type: "text" },
        { Header: "สถาบัน", accessor: "Ref1", codeTranslate: "Ref1", type: "text" },
        { Header: "ศูนย์เงินสด", accessor: "Ref4", codeTranslate: "Ref4", type: "text" },
        { Header: "จำนวน", accessor: "Quantity", codeTranslate: "Quantity", type: "inputNum" },
        { Header: "หน่วยนับ", accessor: "UnitType_Name", codeTranslate: "Unit", type: "text" },
        { Header: "วันที่รับเข้า", accessor: "ProductionDate", codeTranslate: "ProductionDate", type: "text" },
        { Header: "หมายเหตุ", accessor: "Remark", codeTranslate: "Remark", type: "text" },
    ];

    const columnEditItem = [
        { Header: "เลขที่ภาชนะ", accessor: "BaseCode", codeTranslate: "Base Code" },
        { Header: "ชนิดราคา", accessor: "Code", codeTranslate: "Code" },
        { Header: "แบบ", accessor: "Ref2", codeTranslate: "Ref2" },
        { Header: "ประเภทธนบัตร", accessor: "Ref3", codeTranslate: "Ref3" },
        { Header: "สถาบัน", accessor: "Ref1", codeTranslate: "Ref1" },
        { Header: "ศูนย์เงินสด", accessor: "Ref4", codeTranslate: "Ref4" },
        { Header: "จำนวน", accessor: "Quantity", codeTranslate: "Quantity" },
        { Header: "หน่วยนับ", accessor: "UnitType_Name", codeTranslate: "Unit" },
        { Header: "วันที่รับเข้า", accessor: "ProductionDate", codeTranslate: "ProductionDate" },
        { Header: "หมายเหตุ", accessor: "Remark", codeTranslate: "Remark" },


    ];


    const columnEditItemSet = [
        { Header: "Item Code", accessor: "SKUMaster_Code", codeTranslate: "Item Code" },
        { Header: "Item Name", accessor: "SKUMaster_Name", codeTranslate: "Item Name" },
        { Header: "Lot", accessor: "Lot", codeTranslate: "Lot" },
    ];


    const columns = [
        { Header: "เลขที่ภาชนะ", accessor: "BaseCode", codeTranslate: "Base Code" },
        { Header: "ชนิดราคา", accessor: "Code", codeTranslate: "Code" },
        { Header: "แบบ", accessor: "Ref2", codeTranslate: "Ref2" },
        { Header: "ประเภทธนบัตร", accessor: "Ref3", codeTranslate: "Ref3" },
        { Header: "สถาบัน", accessor: "Ref1", codeTranslate: "Ref1" },
        { Header: "ศูนย์เงินสด", accessor: "Ref4", codeTranslate: "Ref4" },
        { Header: "จำนวน", accessor: "Quantity", codeTranslate: "Quantity" },
        { Header: "หน่วยนับ", accessor: "UnitType", codeTranslate: "Unit" },
        { Header: "วันที่รับเข้า", accessor: "ProductionDate", codeTranslate: "ProductionDate" },
        { Header: "หมายเหตุ", accessor: "Remark", codeTranslate: "Remark" },
    ];

    const apicreate = "/v2/CreateGRDocAPI/"; //API ���ҧ Doc
    const apiRes = "/receive/putawaydetail?docID="; //path ˹����������´ �͹����ѧ����Դ

    return <div>
        {table}</div>;
};

export default Create_GR_DR;

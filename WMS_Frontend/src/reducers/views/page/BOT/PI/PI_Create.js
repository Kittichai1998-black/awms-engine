import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";
import AmCreateDoc from '../../../.././components/AmImportDocumentExcel';
import Grid from '@material-ui/core/Grid';
import moment from "moment";
import queryString from "query-string";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";

const Axios = new apicall();

const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const view_sto = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "PackStorageObject",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'packID','od':'ASC'}]",
    sk: 0,
    l: 100,
    all: ""
};


const PI_Create = props => {
    const [CodeprocessType, setCodeprocessType] = useState(1);
    const [table, setTable] = useState();
    const [HeaderDoc, setHeaderDoc] = useState([]);
    const [skuType, setskuType] = useState(4);
    const [columSKU, setcolumSKU] = useState();
    const [skuquery, setskuquery] = useState(SKUMaster);
    const [addlistquery, setaddlistquery] = useState(view_sto);
    const [Type, setType] = useState(true);
    const [ProcessTypeCode, setProcessTypeCode] = useState();
    const [addlist, setaddlist] = useState({})
    const [defaulacts, setdefaulacts] = useState();
    const [souArea, setsouArea] = useState();
    const [proOwner, setproOwner] = useState();

    useEffect(() => {
        setproOwner(localStorage.getItem("User_ProductOwner"))
    }, [localStorage.getItem("User_ProductOwner")])

    useEffect(() => {
        if (CodeprocessType !== "" && CodeprocessType !== null) {
            let Onwer;
            if (proOwner === '1,2') {
                Onwer = {
                    label: "Product Owner", type: "dropdown", key: "productOwnerID", queryApi: ProductOwnerQuery,
                    fieldLabel: ["Code", "Name"], defaultValue: 1,
                }
            } else if (proOwner === '1') {
                Onwer = {
                    label: "Product Owner", type: "dropdown", key: "productOwnerID", queryApi: ProductOwnerQuery,
                    fieldLabel: ["Code", "Name"], defaultValue: 1, disabled: true
                }

            } else if (proOwner === '2') {
                Onwer = {
                    label: "Product Owner", type: "dropdown", key: "productOwnerID", queryApi: ProductOwnerQuery,
                    fieldLabel: ["Code", "Name"], defaultValue: 2, disabled: true
                }

            }
            console.log(Onwer)
            if (Onwer) {
                var headerCreate = [
                    [
                        { label: "Doc No.", type: "labeltext", key: "", texts: "-", codeTranslate: "Document No." },
                        { label: "Doc. Date", type: "date", key: "documentDate", codeTranslate: "Document Date", width: '300px' }
                    ],
                    [
                        { label: "Process No.", type: "dropdown", key: "documentProcessTypeID", queryApi: DocumentProcessTypeQuery, fieldLabel: ["Code", "ReProcessType_Name"], defaultValue: 1003, codeTranslate: "Process Type" },
                        { label: "Action Time", type: "dateTime", key: "actionTime", codeTranslate: "Action Time", width: '300px' }
                    ],
                    [
                        Onwer,
                        { label: "Des Area", type: "dropdown", key: "desAreaMasterID", queryApi: AreaMasterQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Area" }
                    ],
                    [
                        { label: "Sou. Warehouse", type: "dropdown", key: "souWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Source Warehouse" },
                        { label: "Des. Warehouse", type: "dropdown", key: "desWarehouseID", queryApi: WarehouseQuery, fieldLabel: ["Code", "Name"], defaultValue: 1, codeTranslate: "Des Warehouse" }
                    ],
                    [
                        { label: "Doc Status", type: "labeltext", key: "", texts: "NEW", codeTranslate: "Doc Status" },
                        { label: "Remark", type: "input", key: "remark", codeTranslate: "Remark", width: '300px' }
                    ],


                ];

                setHeaderDoc(headerCreate)
                setskuquery();
                setType(true)
            }
        } else {

        }

    }, [proOwner, CodeprocessType]);

    useEffect(() => {
        if (HeaderDoc.length > 0) {

            setTable(
                <AmCreateDocument
                    addList={addlist}
                    headerCreate={HeaderDoc}
                    onChangeProcessType={((e) => { setCodeprocessType(e) })}
                    onChangeProcesTypeSKU={((e) => { setskuType(e) })}
                    onChangeProcessTypeCode={((e) => { setProcessTypeCode(e) })}
                    columns={columns}
                    columnEdit={columSKU}
                    apicreate={apicreate}
                    createDocType={"audit"}
                    history={props.history}
                    defaulact={defaulacts}
                    //itemNo={true}
                    //defualItemNo={'0001'}
                    apiRes={apiRes}
                />
            );
        }


    }, [HeaderDoc, CodeprocessType, addlist])


    useEffect(() => {
        let itemNos = '0001'
        if (SKUMaster) {
            let objQuery = SKUMaster;
            if (objQuery !== null && Type === true && skuType !== undefined) {
                let skuqrys = JSON.parse(objQuery.q);
                skuqrys = [{ "f": "Status", "c": "<", "v": 2 }]
                objQuery.q = JSON.stringify(skuqrys);
            }

            setskuquery(objQuery)
        }



        var columnEdit = [

            {
                Header: "ชนิดราคา",
                accessor: "Code",
                fieldLabel: ["Code"],
                queryApi: skuquery,
                type: "dropdown",
                key: "ID",
                required: true
            },
            { Header: "แบบ", accessor: "ref2", type: "input", width: '300px' },

            {
                Header: "ประเภทธนบัตร",
                accessor: "ref3",
                type: "dropdownvalue",
                key: "value",
                data: TypeSku,
                defaultValue: 'N',
                fieldLabel: ["label"]
            },

            { Header: "สถาบัน", accessor: "ref1", type: "input", width: '300px' },
            { Header: "ศูนย์เงินสด", accessor: "ref4", type: "input", width: '300px' },
            { Header: "จำนวน (%)", accessor: "qtyrandom", type: "inputNum", TextInputnum: "%", required: true },
            {
                Header: "หน่วยนับ",
                accessor: "unitType",
                fieldDataKey: 'UnitType_Code',
                fieldLabel: 'UnitType_Name',
                type: "unitConvert", width: '300px',
                required: true
            },
            { Header: "วันที่รับเข้า", accessor: "productionDate", type: "date", width: '300px' },
            { Header: "หมายเหตุ", accessor: "remark", type: "input", width: '300px' },

        ];

        setcolumSKU(columnEdit)
    }, [skuType, ProcessTypeCode])
    useEffect(() => {

        var addLists = {
            queryApi: view_sto,
            columns: columsFindPopupSto,
            primaryKeyTable: "packID",
        };

        setaddlist(addLists)

    }, [skuType, ProcessTypeCode])

    const TypeSku = [
        { label: 'N', value: 'N' },
        { label: 'G', value: 'G' },
        { label: 'B', value: 'B' },
        { label: 'S', value: 'S' },
        { label: 'U', value: 'U' }

    ]


    const UnitTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "UnitType",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const DocumentProcessTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "DocumentProcessTypeMap",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 2004}]',
        f: "*",
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

    const SupplierQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Supplier",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const ProductOwnerQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "ProductOwner",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "*",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    };

    const AreaMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const columsFindPopupSKU = [
        { Header: "Code", accessor: "Code", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];

    const BaseMasterSto = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "BaseMaster_Sto",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "*",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    };

    const columsFindPopupSto = [
        { Header: "เลขที่ภาชนะ", accessor: "BaseCode" },
        { Header: "ชนิดราคา", accessor: "Code" },
        { Header: "แบบ", accessor: "ref2" },
        { Header: "ประเภทธนบัตร", accessor: "ref3" },
        { Header: "สถาบัน", accessor: "ref1" },
        { Header: "ศูนย์เงินสด", accessor: "ref4" },
        { Header: "จำนวน", accessor: "quantity" },
        { Header: "หน่วยนับ", accessor: "unitType" },
        { Header: "วันที่รับเข้า", accessor: "productionDate", Cell: e => getFormatDatePro(e.original) },
        { Header: "หมายเหตุ", accessor: "remark" }

    ];



    const columns = [
        { Header: "เลขที่ภาชนะ", accessor: "BaseCode" },
        { Header: "ชนิดราคา", accessor: "Code" },
        { Header: "แบบ", accessor: "ref2" },
        { Header: "ประเภทธนบัตร", accessor: "ref3" },
        { Header: "สถาบัน", accessor: "ref1" },
        { Header: "ศูนย์เงินสด", accessor: "ref4" },
        { Header: "จำนวน (%)", accessor: "qtyrandom", Cell: e => getFormatPrscen(e.original) },
        { Header: "จำนวน", accessor: "quantity" },
        { Header: "หน่วยนับ", accessor: "unitType" },
        { Header: "วันที่รับเข้า", accessor: "productionDate", Cell: e => getFormatDatePro(e.original) },
        { Header: "Remark", accessor: "remark" }
    ];



    const getFormatDatePro = (e) => {
        if (e.productionDates) {
            return moment(e.productionDates).format("DD/MM/YYYY");
        }

    }

    const getFormatDateExp = (e) => {
        if (e.expireDates) {
            return moment(e.expireDates).format("DD/MM/YYYY");
        }

    }

    const getFormatPrscen = (e) => {
        if (e.qtyrandom) {
            return e.qtyrandom + '%'
        }
    }

    const getAuditStatus = (e) => {
        if (e.auditStatus) {
            if (e.auditStatus === '0') {
                return "QUARANTINE"
            } else if (e.auditStatus === '1') {
                return "PASSED"
            } else if (e.auditStatus === '2') {
                return "REJECTED"
            } else if (e.auditStatus === '9') {
                return "HOLD"
            }
        }
    }

    const apicreate = "/v2/CreateADDocAPI/"; //API สร้าง Doc
    const apiRes = "/counting/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    return <div>
        {table}</div>;
};

export default PI_Create;

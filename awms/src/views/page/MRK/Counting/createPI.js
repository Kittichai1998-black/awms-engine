import React, { useState, useEffect } from "react";

import AmCreateDocument from '../../../../components/AmCreateDocument'
import { apicall, createQueryString } from '../../../../components/function/CoreFunction'
import DocView from "../../../pageComponent/DocumentView";//css

// import Axios from 'axios'
const Axios = new apicall()

export default (props) => {

    const [dataWarehouse, setDataWarehouse] = useState("");
    const [dataHeader, setDataHeader] = useState([]);
    const [table, setTable] = useState(null);

    useEffect(() => { //createQueryString is add isCounts, apiKey
        Axios.get(createQueryString(WarehouseQuery)).then((row) => {
            if (row.data.datas.length > 0) {
                setDataWarehouse(row.data.datas[0])
            }
        })
    }, [])

    useEffect(() => {
        if (dataWarehouse !== "") {
            const headerCreates = [
                [
                    { label: "Document No.", type: "labeltext", key: "", texts: "-" },
                    { label: "Document Date", type: "date", key: "documentDate" }
                ],
                [
                    { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "FG_PHYSICAL_COUNT_WM ", valueTexts: "1041" },
                    { label: "Action Time", type: "dateTime", key: "actionTime" }
                ],
                [
                    { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: dataWarehouse.Name, valueTexts: dataWarehouse.ID },
                    { label: "Destination Warehouse", type: "labeltext", key: "desWarehouseID", texts: dataWarehouse.Name, valueTexts: dataWarehouse.ID }
                ],
                [
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW" },
                    { label: "Remark", type: "input", key: "remark" }
                ]
            ];
            setDataHeader(headerCreates)
        }
    }, [dataWarehouse])

    useEffect(() => {
        if (dataHeader.length > 0) {
            setTable(
                <AmCreateDocument
                    headerCreate={dataHeader}
                    columns={columns}
                    columnEdit={columnEdit}
                    apicreate={apicreate}
                    createDocType={"audit"}
                    history={props.history}
                    apiRes={apiRes}
                />
            )
        }
    }, [dataHeader])

    const PalletCode = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "PalletSto",
        q: '', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
        f: "ID,palletcode,Code,Batch,Name",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 100,
        all: ""
    }

    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name,UnitTypeCode,concat(Code, ':' ,Name) as SKUItem, ID as SKUID,concat(Code, ':' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    }
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
    }

    const AreaLocationMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code AS locationcode,Name,Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    }

    const columsFindpopUp = [
        { Header: 'Code', accessor: 'Code', fixed: 'left', width: 100, sortable: true },
        { Header: 'Name', accessor: 'Name', width: 250, sortable: true }
    ];

    const columsFindpopUpPALC = [
        { Header: 'Pallet Code', accessor: 'palletcode', fixed: 'left', width: 200, sortable: true },
        { Header: 'Pack Code', accessor: 'Code', width: 200, sortable: true },
        { Header: 'Batch', accessor: 'Batch', width: 200, sortable: true },
        { Header: 'Name', accessor: 'Name', width: 200, sortable: true }
    ];

    const columnEdit = [
        { Header: "Pallet Code", accessor: 'palletcode', type: "findPopUp", idddl: "palletcode", queryApi: PalletCode, fieldLabel: ["palletcode"], columsddl: columsFindpopUpPALC },
        { Header: "Location", accessor: 'locationcode', type: "findPopUp", pair: "locationcode", idddl: "locationcode", queryApi: AreaLocationMaster, fieldLabel: ["Code"], columsddl: columsFindpopUp },
        { Header: "SKU Item", accessor: 'SKUItems', type: "findPopUp", pair: "skuCode", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"], columsddl: columsFindpopUp },
        { Header: 'OrderNO', accessor: 'orderNo', type: "input" },
        // { Header: "Quantity", accessor: 'quantity', type: "inputNum" },
        { Header: "Counting (%)", accessor: "qtyrandom", type: "inputNum", TextInputnum: "%" }
    ];

    const columns = [
        { Header: 'Pallet Code', accessor: 'palletcode' },
        { Header: 'Location', accessor: 'locationcode' },
        { Header: "SKU Item", accessor: 'SKUItems', width: 250 },
        { Header: 'Order NO', accessor: 'orderNo' },
        { Header: "Counting (%)", accessor: 'qtyrandom' },
        { Header: "Unit", accessor: 'unitType', type: "unitType" }
    ];

    const apicreate = "/v2/CreateADDocAPI/"  //API ���ҧ Doc
    const apiRes = "/counting/detail?docID=" //path ˹����������´ �͹����ѧ����Դ

    return table
}
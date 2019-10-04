import React, { Component, useState, useEffect } from "react";
import AmCreateDocument from "../../../../components/AmCreateDocument";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import axios from "axios";
import Clone from "../../../../components/function/Clone";
const Axios = new apicall();

const CreateDocGICus = props => {
    const [dataWarehouse, setDataWarehouse] = useState("");
    const [dataMovementType, setDataMovementType] = useState("");
    const [dataMovementTypeCUS, setDataMovementTypeCUS] = useState("");
    const [dataType2, setDataType2] = useState("");
    const [dataTest, setDataTest] = useState([]);
    const [table, setTable] = useState(null);

    useEffect(() => {
        Axios.get(createQueryString(WarehouseQuery)).then((row) => {
            if (row.data.datas) {
                setDataWarehouse(row.data.datas[0].Name)
            }

        })
        Axios.get(createQueryString(MovementTypeQuery2)).then((res) => {
            if (res.data.datas) {
                console.log(res.data.datas[0].Name)
                setDataMovementTypeCUS(res.data.datas[0].Name)
            }
        })

    }, [])


    useEffect(() => {
        // getURL()
        if (dataWarehouse !== "" && dataMovementTypeCUS !== "") {

            var headerCreates = [
                [{ label: "Document No.", type: "labeltext", key: "", texts: "-" }, { label: "Document Date", type: "date", key: "documentDate" }],
                [{ label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: dataMovementTypeCUS, valueTexts: "1012" }, { label: "Action Time", type: "dateTime", key: "actionTime" },],
                [{ label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: dataWarehouse, valueTexts: "1" },
                { label: "Destination Customer", key: "desCustomerID", type: "dropdown", pair: "ID", idddl: "desCustomerID", queryApi: CustomerQuery, fieldLabel: ["Code", "Name"] }],
                [{ label: "Doc Status", type: "labeltext", key: "", texts: "New" }, { label: "", type: "", key: "" }],
                //[{ Header: "SKU Items", accessor: 'SKUItems', type: "dropdown", pair: "SKUIDs", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"] },{ label: "", type: "", key: "",texts: "" },] 
            ];
            //setDataTest(headerCreates)
            if (headerCreates.length > 0) {
                setTable(<AmCreateDocument
                    headerCreate={headerCreates}
                    columns={columns}
                    columnEdit={columnEdit}
                    apicreate={apicreate}
                    createDocType={"issue"}
                    history={props.history}
                    apiRes={apiRes}
                    createByCus={true}
                >
                </AmCreateDocument>)
            }
        }

    }, [dataWarehouse, dataMovementTypeCUS])


    // useEffect(()=> {
    //    console.log(dataTest)
    //     if(dataTest.length > 0  ){
    //         setTable(<AmCreateDocument
    //             headerCreate={dataTest} 
    //             columns={columns}  
    //             columnEdit={columnEdit}
    //             apicreate={apicreate} 
    //             createDocType={"issue"} 
    //             history={props.history} 
    //             apiRes={apiRes} 
    //         >
    //         </AmCreateDocument>)
    //     }   
    // },[dataTest,props.location.search])


    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name,UnitTypeCode,concat(Code, ':' ,Name) as SKUItem, ID as SKUID,concat(Code, ':' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
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
        all: "",
    }
    const WarehouseQuery2 = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    const CustomerQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"<", "v": 2},]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    const MovementTypeQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "MovementType",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1011}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    const MovementTypeQuery2 = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "MovementType",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v":1012}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const columsFindpopUp = [

        {
            Header: 'Code',
            accessor: 'Code',
            fixed: 'left',
            width: 130,
            sortable: true,
        },
        {
            Header: 'Name',
            accessor: 'Name',
            width: 200,
            sortable: true,
        },
    ];


    const columnEdit = [{ Header: 'Pallet Code', accessor: 'palletcode', type: "input" },
    { Header: "Part NO.", accessor: 'SKUItems', type: "skubyCus", queryApi: SKUMaster, pair: "skuCode", idddl: "skuitems", fieldLabel: ["Code", "Name"], columsddl: columsFindpopUp },
    { Header: 'Lot', accessor: 'lot', type: "input" },
    { Header: "Quantity", accessor: 'quantity', type: "inputNum" },
    { Header: "Unit", accessor: 'unitType', type: "unitType", width: 70 },
    { Header: "Example", type: "text", texts: "Qty = 20" },
    ];



    const columns = [{ Header: 'Pallet Code', accessor: 'palletcode', width: 100 },
    { Header: "Part NO.", accessor: 'SKUItems' },
    { Header: 'Lot', accessor: 'lot', width: 100 },
    { Header: "Quantity", accessor: 'quantity', width: 70 },
    { Header: "Unit", accessor: 'unitType', width: 70 },
    ];

    const apicreate = "/v2/CreateGIDocAPI/"  //API ���ҧ Doc
    const apiRes = "/issue/detail?docID=" //path ˹����������´ �͹����ѧ����Դ

    return (

        <div>
            {table}
        </div>

    )
};

export default CreateDocGICus;

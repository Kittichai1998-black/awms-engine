import React, { useState, useEffect, useContext } from "react";
import AmProcessQueue from '../../../../components/AmProcessQueue';
import Axios from 'axios';

const createQueryString = (select) => {
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
        + (select.q === "" ? "" : "&q=" + select.q)
        + (select.f === "" ? "" : "&f=" + select.f)
        + (select.g === "" ? "" : "&g=" + select.g)
        + (select.s === "" ? "" : "&s=" + select.s)
        + (select.sk === "" ? "" : "&sk=" + select.sk)
        + (select.l === 0 ? "" : "&l=" + select.l)
        + (select.all === "" ? "" : "&all=" + select.all)
        + "&isCounts=true"
        + "&apikey=free01"
    return queryS
}
const WorkQueueSTGTCounting = (props) => {

    const AreaMaster = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 100,
        all: "",

    }

    const Warehouse = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 100,
        all: "",

    }

    const orderDDL = [
        { label: 'FIFO', value: 'FIFO' },
        { label: 'LIFO', value: 'LIFO' },
    ];
    const ordersDDL = [
        { label: 'Carton No', value: 'Orderno' },
        { label: 'Order No', value: 'Orderno' },
        { label: 'Createtime', value: 'createtime' },

    ];


    const Priolity = [
        { label: 'Very Low', value: '0' },
        { label: 'Low', value: '1' },
        { label: 'Normal', value: '2' },
        { label: 'High', value: '3' },
        { label: 'Very High', value: '4' },
        { label: 'Critical', value: '5' },
    ];
    const [DataSource, setDataSource] = useState();
    const [query, setQuery] = useState(Document);
    const [documentID, setDocumentID] = useState();
    const [dataDetail, setdataDetail] = useState();
    const [datasDetails, setdatasDetails] = useState([]);
    const [DeswarehouseID, setDeswarehouseID] = useState();
    const [movement, setmovement] = useState();
    const [remark, setremark] = useState();
    const [souware, setsouware] = useState();
    const [desware, setdesware] = useState();


    const detailDocument = [
        [{ "label": "Movement Type :", "type": "label", "values": movement },
        { "label": "Remark :", "values": remark, "type": "label" },
        { "label": "Source Warehouse :", "values": souware, "type": "label" },
        { "label": "Destination Warehouse :", "values": desware, "type": "label" }],
    ];


    useEffect(() => {
        setdatasDetails([...detailDocument])
    }, [desware, documentID])

    useEffect(() => {
        getDetailDoc();
    }, [documentID])

    const Document = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "EventStatus", "c":"=", "v": 10},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
        f: "ID as value, Code as label, ID, Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const getDetailDoc = () => {
        Axios.get(window.apipath + "/v2/GetDocAPI/?docTypeID=" + "2004" + "&docID=" + documentID + "&getMapSto=true&_token=" + localStorage.getItem("Token")).then((res) => {
            if (res.data._result.status === 1) {
                var doc = res.data.document
                setmovement(doc.movementName);
                setremark(doc.remark);
                setsouware(doc.souWarehouseName);
                setdesware(doc.desWarehouseName);
            } else {

            }
        })

    }

    const columnCondition = [{ Header: 'Batch', accessor: 'Batch', type: "input", field: 'Batch' },
    { Header: 'Lot', accessor: 'Lot', type: "input", field: 'Lot' },
    { Header: "Order", accessor: 'OrderNo', type: "input", field: 'OrderNo' },
        { Header: 'Unit', accessor: 'UnitType_Name', type: "unitType", field: 'Unit' }

    ];

    const columnSort = [
        { Header: 'Order ', accessor: 'Order', type: "dropdown", field: 'Order', dataDDL: orderDDL, idddls: "Order" },
        { Header: 'By', accessor: 'By', type: "dropdown", field: 'By', dataDDL: ordersDDL, idddls: "By" },

    ]; 
    const columnConfirm = [
        { Header: 'SKU', accessor: 'SKU', width: 200 },
        { Header: 'Pallet', accessor: 'Pallet', },
        { Header: 'Batch', accessor: 'Batch', },
        { Header: 'Lot', accessor: 'Lot', },
        { Header: "Order", accessor: 'OrderNo', },
        { Header: 'Qty', accessor: 'BaseQuantity', Footer: true },
        { Header: "Unit", accessor: 'Unit', },
    ];

    const ProcessQ = [
        { Label: 'Destination Area', key: 'desASRSAreaCode', type: "dropdownapi", fieldLabel: ["Code", "Name"], idddls: "desASRSAreaCode", queryApi: AreaMaster, defaultValue: 8 },

    ];

    return (<div>
        <AmProcessQueue
            // apiDocument={Document}
            detailDocument={datasDetails}
            orderDDL={orderDDL}
            ordersDDL={ordersDDL}      
            columnCondition={columnCondition}
            columnSort={columnSort}
            columnConfirm={columnConfirm}
            ProcessQ={ProcessQ}
            history={props.history}
            apiwarehouse={Warehouse}
            advanceCondition={true}
            //fullPallet={true}
            //receive={true}
            FullPallet={true}
            defaultFullPallete={true}
            disibleFullPallet={true}
            AllStatus={true}
            priolity={Priolity}
            DocType={2004}
            status={true}
            random={true}
            docType={"audit"}
            StatusHold={false}
            StatusReject={false}
            dataSort={false}
            apiResConfirm={"/counting/managequeue"}
            apidetail={"/counting/detail?docID="}

        ></AmProcessQueue>

    </div>)

}

export default WorkQueueSTGTCounting;
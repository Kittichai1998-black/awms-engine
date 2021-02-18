import React, { useState, useEffect, useContext } from "react";
import AmProcessQueue from '../../components/AmProcessQueue';
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
const TestProcess = (props) => {

   


    const AreaMaster = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code",
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
        { label: 'Recive Date', value: 'ReciveDate' },
        { label: 'createtime', value: 'createtime' },
        { label: 'Batch', value: 'Batch' },
        { label: 'Lot', value: 'Lot' },
        { label: 'OrderNo', value: 'OrderNo' },

    ]

    const desASRSAreaCode = [
        { label: 'FS', value: 'FS' },
        { label: 'SM', value: 'SM' },
    ]

    const [desCustomer, setdesCustomer] = useState();
    const [desCustomerName, setdesCustomerName] = useState();

    const detailDocument = [
        [{ "label": "DesCustomer :", "type": "label", "key": "desCustomer", "values": desCustomer }, { "label": "DesCustomerName:", "values": desCustomerName, "type": "label", "key": "desCustomerName" },
        { "label": "Ref1 :", "values": ref1, "type": "label", "key": "ref1" }, { "label": "RefID:", "values": refID, "type": "label", "key": "refID" }],

    ];

    const [DataSource, setDataSource] = useState();
    const [query, setQuery] = useState(Document);
    const [documentID, setDocumentID] = useState();
    const [ref1, setref1] = useState();
    const [refID, setrefID] = useState();
    const [dataDetail, setdataDetail] = useState();
    const [datasDetails, setdatasDetails] = useState([]);
    const [CreateQueue, setCreateQueue] = useState()
    const [DeswarehouseID, setDeswarehouseID] = useState();

 useEffect(() => {
        setdatasDetails([...detailDocument])
    }, [desCustomer])

    useEffect(() => {
        getDetailDoc();
    }, [documentID])

    const Document = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "EventStatus", "c":"!=", "v": 11},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
        f: "ID as value, Code as label, ID, Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }


    const getDetailDoc = () => {
        Axios.get(window.apipath + "/v2/GetDocAPI/?docTypeID=" + "1002" + "&docID=" + documentID + "&getMapSto=true&_token=" + localStorage.getItem("Token")).then((res) => {
            if (res.data._result.status === 1) {
                var doc = res.data.document
                console.log(doc)
                setdesCustomer(doc.desCustomer)
                setdesCustomerName(doc.desCustomerName)
                setref1(doc.desWarehouseName)
                setrefID(doc.refID)
            } else {

            }
        })

    }

    const columnCondition = [{ Header: 'Batch', accessor: 'Batch', type: "input", field: 'Batch' },
    { Header: 'Lot', accessor: 'Lot', type: "input", field: 'Lot' },
    { Header: "Order", accessor: 'OrderNo', type: "input", field: 'OrderNo' },
    { Header: 'Qty', accessor: 'BaseQuantity', type: "inputnum", field: 'BaseQuantity' }
       
    ];

    const columnSort = [
        { Header: 'Order ', accessor: 'Order', type: "dropdown", field: 'Order', dataDDL: orderDDL, idddls: "Order" },
        { Header: 'By', accessor: 'By', type: "dropdown", field: 'By', dataDDL: ordersDDL, idddls: "By" },

    ];


    const columnConfirm = [
    { Header: 'SKU', accessor: 'SKU', width: 200},
    { Header: 'Pallet', accessor: 'Pallet', },
    { Header: 'Batch', accessor: 'Batch', },
    { Header: 'Lot', accessor: 'Lot', },
    { Header: "Order", accessor: 'OrderNo', },
        { Header: 'Qty', accessor: 'BaseQuantity', Footer:true},
    { Header: "Unit", accessor: 'Unit', },
    ];

    const ProcessQ = [
        { Label: 'Area', key: 'desASRSAreaCode', type: "dropdownapi", fieldLabel: ["Code"], idddls: "desASRSAreaCode", queryApi: AreaMaster },

    ];

    return (<div>
        <AmProcessQueue
            apiDocument={Document}
            detailDocument={datasDetails}
            orderDDL={orderDDL}
            ordersDDL={ordersDDL}
            onChangeDoc={(value) => setDocumentID(value)}
            onChangeWarehouse={(value) => setDeswarehouseID(value)}
            columnCondition={columnCondition}
            columnSort={columnSort}
            columnConfirm={columnConfirm}
            ProcessQ={ProcessQ}
            history={props.history}
            apiwarehouse={Warehouse}
            advanceCondition={true}
            DocType={1002}
            status={true}
            random={false}
            apidetail={"/counting/detail?docID="}
            //docType={"re"}
        ></AmProcessQueue>

    </div>)

}

export default TestProcess;
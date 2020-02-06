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
const WorkQueueSTGT = (props) => {

    const AreaMaster = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "Code", "c":"in", "v": "LD,PD"}]',
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
        { label: 'Carton No', value: 'Carton No' },
        { label: 'SI (Order No)', value: 'Order No' },
        { label: 'Createtime', value: 'Createtime' }, 
      
    ];

    const Priolity = [
        { label: 'Very Low', value: '0' },
        { label: 'Low', value: '1' },
        { label: 'Normal', value: '2' },
        { label: 'High', value: '3' },
        { label: 'Very High', value: '4' },
        { label: 'Critical', value: '5' },
    ];


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

    const columnCondition = [
        { Header: "SI (Order No)", accessor: 'OrderNo', type: "input", field: 'OrderNo' },
    { Header: 'Qty', accessor: 'BaseQuantity', type: "inputnum", field: 'BaseQuantity' },
    { Header: 'Unit', accessor: 'UnitType_Name', type: "unitType", field: 'Unit' }

    ];

    const columnSort = [
        { Header: 'Sorting', accessor: 'Order', type: "dropdown", field: 'Order', dataDDL: orderDDL, idddls: "Order" },
        { Header: 'By', accessor: 'By', type: "dropdown", field: 'By', dataDDL: ordersDDL, idddls: "By" },

    ];

    const DefaulSorting = [{
        By: "Carton No",
        value: "Carton No",
        ID: 0,
        Order: "FIFO"
    }]
  

    const columnConfirm = [
        { Header: "SI (Order No)", accessor: 'OrderNo', },
        { Header: 'Pallet', accessor: 'Pallet', },
        { Header: 'Reorder (Item Code)', accessor: 'SKU', width: 350 },
        { Header: 'Qty', accessor: 'BaseQuantity', Footer: true },
        { Header: "Unit", accessor: 'Unit', },
    ];

    const ProcessQ = [
        { Label: 'Destination Area', key: 'desASRSAreaCode', type: "dropdownapi", fieldLabel: ["Code", "Name"], idddls: "desASRSAreaCode", queryApi: AreaMaster, defaultValues:14 },

    ];

    return (<div>
        <AmProcessQueue
            orderDDL={orderDDL}
            ordersDDL={ordersDDL}
            columnCondition={columnCondition}
            columnSort={columnSort}
            columnConfirm={columnConfirm}
            ProcessQ={ProcessQ}
            DefaulSorting={DefaulSorting}
            history={props.history}
            apiwarehouse={Warehouse}
            advanceCondition={false}
            //fullPallets={true}
            // receives={true}
            priolity={Priolity}
            DocType={1002}
            docType={"issue"}
            status={true}
            random={false}
            dataSortShow={true}
            FullPallet={false}
            //defaultFullPallete={false}
            //disibleFullPallet={false}
            QtyAfterDoneWQ={true}
            StatusfromDeswarehouse={true}
            StatusfromDescustomer={true}
            apidetail={"/issue/detail?docID="}
            apiResConfirm={"/issue/managequeue"}
            Defaulwarehouse={1}
            
        ></AmProcessQueue>

    </div>)

}

export default WorkQueueSTGT;
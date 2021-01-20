import React, { useState, useEffect, useContext } from "react";
import AmWave from "../pageComponent/AmWaveManagement/Amwave";
import { WaveContext } from '../pageComponent/AmWaveManagement/WaveContext';


const colWave = [

    { "accessor": "Code", "Header": "Code", "sortable": false, },
    { "accessor": "Name", "Header": "Name", "sortable": false },
    { "accessor": "Description", "Header": "Description", "sortable": false },

];
const colDetail = [
    { "accessor": "StoCode", "Header": "Code", "sortable": false, "width": 200 },
    { "accessor": "StoName", "Header": "Name", "sortable": false },
    { "accessor": "StoQty", "Header": "Qty", "sortable": false },
    { "accessor": "AreaName", "Header": "AreaName", "sortable": false },
];

const Wave = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "Wave",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const Wavemange = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "WaveManage",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const ArealocationMaster = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaLocationMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const AreaMaster = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};


const WaveSeq = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "WaveSeq",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
};

const waveCustomtabRunmode = [
    { 'label': "Manual", "value": 0 },
    { 'label': "Manual2", "value": 1 },
    { 'label': "Manual3", "value": 2 },
    { 'label': "Manual4", "value": 3 }

]

const AmWaveManagement = () => {
    return <AmWave
        waveColumns={colWave}
        wavedetailColumns={colDetail}
        waveDialog={true}
        waveQuery={Wave}
        waveManageQuery={Wavemange}
        waveSeqQuery={WaveSeq}
        waveArealocationMasterQuery={ArealocationMaster}
        waveAreaMasterQuery={AreaMaster}
    //waveCustomtabRunmode={waveCustomtabRunmode}


    />
}

export default AmWaveManagement;
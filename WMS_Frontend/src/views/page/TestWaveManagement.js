import React, { useState, useEffect, useContext } from "react";
import AmWave from "../pageComponent/AmWaveManagement/Amwave";
import { WaveContext } from '../pageComponent/AmWaveManagement/WaveContext';


const colWave = [

    { "accessor": "Code", "Header": "Code", "sortable": false,  },
    { "accessor": "Name", "Header": "Name", "sortable": false },
    { "accessor": "Description", "Header": "Description", "sortable": false },
   
];
const colDetail = [
    { "accessor": "StoCode", "Header": "Code", "sortable": false, "width": 200 },
    { "accessor": "StoName", "Header": "Name", "sortable": false },
    { "accessor": "StoQty", "Header": "Qty", "sortable": false},
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


const AmWaveManagement = () => {
    return <AmWave
        waveColumns={colWave}
        detailColumns={colDetail}
        waveQuery={Wave}
        waveManageQuery={Wavemange}

    />
}

export default AmWaveManagement;
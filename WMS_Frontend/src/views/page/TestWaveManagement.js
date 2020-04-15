import React, { useState, useEffect, useContext } from "react";
import AmWave from "../pageComponent/AmWaveManagement/Amwave";
import { WaveContext } from '../pageComponent/AmWaveManagement/WaveContext';


const colWave = [

    { "accessor": "Code", "Header": "Code", "sortable": false,  },
    { "accessor": "Name", "Header": "Name", "sortable": false },
    { "accessor": "Description", "Header": "Description", "sortable": false },
   
];
const colDetail = [
    { "accessor": "Code", "Header": "CodeV2", "sortable": false, "width": 200 },
    { "accessor": "SKUMaster_Name", "HeaderV2": "Name", "sortable": false },
    { "accessor": "Quantity", "Header": "QtyV2", "sortable": false, "width": 80 },
    { "accessor": "UnitType_Name", "HeaderV2": "Unit", "sortable": false, "width": 80 },
];

const Wavemange = {
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


const AmWaveManagement = () => {
    return <AmWave
        waveColumns={colWave}
        detailColumns={colDetail}
        WavemangeQuery={Wavemange}

    />
}

export default AmWaveManagement;
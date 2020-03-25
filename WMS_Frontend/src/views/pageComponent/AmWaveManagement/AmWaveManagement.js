import React, { useState } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AmWaveDetail from "./AmWaveDetail";

const AmWaveManagement = (props) => {
    const [currentTab, setCurrentTab] = useState(0);

    return <>
        <Tabs value={currentTab} onChange={(e, n) => {setCurrentTab(n);}}>
            <Tab label="Manual" />
            <Tab label="Sequence" />
            <Tab label="Schedule" />
        </Tabs>
        <AmWaveDetail
            currentTab={currentTab} 
            waveQuery={props.waveQuery} 
            waveColumns={props.waveColumns} 
            detailColumns={props.detailColumns}
        />
    </>
}

export default AmWaveManagement;
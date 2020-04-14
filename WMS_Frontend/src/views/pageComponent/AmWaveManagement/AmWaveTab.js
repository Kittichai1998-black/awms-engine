import React, { useState, useContext } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AmWaveManagement from "./AmWaveManagement";
import { WaveContext } from './WaveContext';

const AmWaveTab = (props) => {
    const [currentTab, setCurrentTab] = useState(0);
    const { wave } = useContext(WaveContext)

    return <>
        <Tabs value={currentTab} onChange={(e, n) => { setCurrentTab(n); }}>
            <Tab label="Manual" />
            <Tab label="Sequence" />
            <Tab label="Schedule" />
        </Tabs>


        
    </>
}

export default AmWaveTab;
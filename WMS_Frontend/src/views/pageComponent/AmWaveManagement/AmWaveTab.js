import React, { useState, useContext } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AmWaveManagement from "./AmWaveManagement";
import { WaveContext } from './WaveContext';

const AmWaveTab = (props) => {
    const [currentTab, setCurrentTab] = useState(0);
    const { wave, tabModes } = useContext(WaveContext)


    const OnchaneTab = (e, n) => {
        tabModes.setTabMode(n)
    }


    return <>
        <Tabs value={currentTab} onChange={(e, n) => OnchaneTab(e,n)}>
            <Tab label="Manual" value={1}/>
            <Tab label="Sequence" value={2}/>
            <Tab label="Schedule" value={3} />
        </Tabs>


        
    </>
}

export default AmWaveTab;
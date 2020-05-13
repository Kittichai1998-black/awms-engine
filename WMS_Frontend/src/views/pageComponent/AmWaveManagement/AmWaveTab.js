import React, { useState, useContext, useEffect } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import AmWaveManagement from "./AmWaveManagement";
import {
    apicall,
    createQueryString,
    IsEmptyObject
} from "../../../components/function/CoreFunction2";
import { WaveContext } from './WaveContext';
var Axios = new apicall();


const useWaveManageQuery = (query, waveIDs) => {
    const [waveManageQury, setwaveManageQury] = useState(query);
    useEffect(() => {
        if (query != null) {
            let objQuery = { ...query };
            if (objQuery !== null) {
                let getWaveDetail = JSON.parse(objQuery.q);
                getWaveDetail.push({ 'f': 'Wave_ID', 'c': '=', 'v': waveIDs })
                objQuery.q = JSON.stringify(getWaveDetail);
                //{ 'f': 'waveSeq', 'c': '=', 'v': mode }
            }
            setwaveManageQury(objQuery)
        }
    }, [query, waveIDs])

    return waveManageQury;
}





const AmWaveTab = (props) => {
    const [currentTab, setCurrentTab] = useState(0);
    const { wave, tabModes } = useContext(WaveContext)
    const waveDetailQuery = useWaveManageQuery(props.waveSeqQuery, wave.waveID)
    const [datasEvent, setdatasEvent] = useState();

    const OnchangeTab = (e, n) => {
        console.log(n)
        tabModes.setTabMode(n)
    }

    useEffect(() => {
        if (wave.waveID != 0) {
            getData(waveDetailQuery)
        }
    }, [waveDetailQuery, wave.waveID])


    const getData = (waveDetailQuerys) => {
        Axios.get(createQueryString(waveDetailQuerys)).then(res => {
            setdatasEvent(res.data.datas)

        })
    }

    const runTab = () => {
        return <div>
            <Paper square><Tabs
                indicatorColor="primary"
                textColor="primary"
                value={currentTab}
                onChange={(e, n) => OnchangeTab(e, n)}> 
              {datasEvent.map(row => {
                  let Estaus = row.End_StorageObject_EventStatus
            if (Estaus == 11) {
                return <div><Tab label="RECEIVING" value={11} onChange={(e, n) => OnchangeTab(e, n)}/ ></div>
            } else if (Estaus == 12) {
                return <div><Tab label="RECEIVED" value={12} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 13) {
                return <div><Tab label="AUDITING" value={13} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 14) {
                return <div><Tab label="AUDITED" value={14} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 15) {
                return <div><Tab label="ALLOCATING" value={15} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 16) {
                return <div><Tab label="ALLOCATED" value={16} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 17) {
                return <div><Tab label="PICKING" value={17} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 18) {
                return <div><Tab label="PICKED" value={18} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 21) {
                return <div><Tab label="REMOVING" value={21} onChange={(e, n) => OnchangeTab(e, n)} /></div >
            } else if (Estaus == 22) {
                return <div><Tab label="REMOVED" value={22} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 23) {
                return <div><Tab label="REJECTING" value={23} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 24) {
                return <div><Tab label="REJECTED" value={24} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 31) {
                return <div><Tab label="SHIPPING" value={31} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 32) {
                return <div><Tab label="SHIPPED" value={32} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 96) {
                return <div><Tab label="RETURN" value={96} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 97) {
                return <div><Tab label="PARTIAL" value={97} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 98) {
                return <div><Tab label="QC" value={98} onChange={(e, n) => OnchangeTab(e, n)}/></div >
            } else if (Estaus == 99) {
                return <div><Tab label="HOLD" value={99} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 111) {
                return <div><Tab label="CONSOLIDATING" value={111} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 112) {
                return <div><Tab label="CONSOLIDATED" value={112} onChange={(e, n) => OnchangeTab(e, n)}/></div>
            } else if (Estaus == 113) {
                return <div><Tab label="LOADING" value={113} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else if (Estaus == 114) {
                return <div><Tab label="LOADED" value={114} onChange={(e, n) => OnchangeTab(e, n)} /></div>
            } else {

            }

              })}
            </Tabs></Paper></div>

        }
    
    return <>
        <div>
            {datasEvent !== undefined ?
                runTab()
          : null}
        </div>


        
    </>
}

export default AmWaveTab;
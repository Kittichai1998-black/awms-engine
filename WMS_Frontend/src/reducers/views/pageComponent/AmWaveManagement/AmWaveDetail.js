import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  IsEmptyObject
} from "../../../components/function/CoreFunction2";
import queryString from "query-string";
import AmTable from "../../../components/AmTable/AmTable";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { WaveContext } from './WaveContext';
var Axios = new apicall();


const useWaveManageQuery = (query, waveIDs, mode, waveMode) => {
    const [waveManageQury, setwaveManageQury] = useState(query);
    const { wave, tabModes } = useContext(WaveContext)
    useEffect(() => {
       
        if (query != null) {
            let objQuery = { ...query };
            if (objQuery !== null) {
                let getWaveDetail = JSON.parse(objQuery.q);
                getWaveDetail.push({ 'f': 'waveID', 'c': '=', 'v': waveIDs }, { 'f': 'statusStoEndWave', 'c': '=', 'v': mode })
                objQuery.q = JSON.stringify(getWaveDetail);
                //{ 'f': 'waveSeq', 'c': '=', 'v': mode }
            }
            setwaveManageQury(objQuery)
        }
    }, [query, waveIDs, mode, waveMode,tabModes.TabMode])

    return waveManageQury;
}


const AmWaveDetail = (props) => {
    const { wave, tabModes } = useContext(WaveContext)
    const waveDetailQuery = useWaveManageQuery(props.waveManageQuery, wave.waveID, tabModes.TabMode, wave.waveRunMode)
    const [DatawaveDetail, setDatawaveDetail] = useState([]);

    useEffect(() => {
        console.log(wave.waveID)
        if (wave.waveID !== 0) {
            getData(waveDetailQuery)
        } else if (wave.waveID == "") { 
            setDatawaveDetail([])
        }
    }, [waveDetailQuery, wave.waveID])


    const getData = (waveDetailQuerys) => {
        Axios.get(createQueryString(waveDetailQuerys)).then(res => {
            setDatawaveDetail(res.data.datas);
        })
    }

    return <>
        <div style={{ marginTop:"10px" }}>
        <AmTable
                columns={props.wavedetailColumns}
            dataSource={DatawaveDetail}
                sortable={false} />
        </div>
    </>
}

export default AmWaveDetail;
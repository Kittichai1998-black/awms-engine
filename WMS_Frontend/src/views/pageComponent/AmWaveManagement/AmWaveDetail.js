import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  IsEmptyObject
} from "../../../components/function/CoreFunction2";
import queryString from "query-string";
import {AmTable} from "../../../components/table";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { WaveContext } from './WaveContext';
var Axios = new apicall();


const useWaveDetailColumns = (waveDetailColumns) => {


}


const useWaveManageQuery = (query, waveIDs, mode, waveMode) => {
    console.log(mode)
    const [waveManageQury, setwaveManageQury] = useState(query);
    useEffect(() => {
       
        if (query != null) {
            let objQuery = { ...query };
            if (objQuery !== null) {
                let getWaveDetail = JSON.parse(objQuery.q);
                getWaveDetail.push({ 'f': 'waveID', 'c': '=', 'v': waveIDs }, { 'f': 'waveSeq', 'c': '=', 'v': mode })
                objQuery.q = JSON.stringify(getWaveDetail);
                //{ 'f': 'waveSeq', 'c': '=', 'v': mode }
            }
            setwaveManageQury(objQuery)
        }
    }, [query, waveIDs, mode, waveMode])

    return waveManageQury;
}


const AmWaveDetail = (props) => {
    const { wave, tabModes } = useContext(WaveContext)
    const waveDetail = useWaveDetailColumns(props.detailColumns)
    const waveDetailQuery = useWaveManageQuery(props.waveManageQuery, wave.waveID, tabModes.TabMode, wave.waveRunMode)
    const [DatawaveDetail, setDatawaveDetail] = useState();

    useEffect(() => {
        if (wave.waveID !== 0) {
            getData(waveDetailQuery)
        }
    }, [waveDetailQuery])

    const getData = (waveDetailQuerys) => {
        console.log(waveDetailQuerys)
        Axios.get(createQueryString(waveDetailQuerys)).then(res => {
            setDatawaveDetail(res.data.datas);
        })
    }

    return <>
        <AmTable columns={props.detailColumns} data={DatawaveDetail} sortable={false} />
         

        
    </>
}

export default AmWaveDetail;
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
var Axios = new apicall();

const useWaveList = (waveQuery, waveType) => {
    const [waveList, setWaveList] = useState([]);

    useEffect(()=> {
        Axios.get(createQueryString(waveQuery)).then(res => {
            if(res.data.datas.length > 0){
                setWaveList(res.data.datas);
              }
        })
    }, [waveQuery, waveType])

    return waveList;
}

const useWaveColumns = (waveColumns) => {
    const [columns, setColumns] = useState(waveColumns);

    useEffect(() => {
        let xx = [...waveColumns];
        xx.unshift({"accessor":"Code", "Header":"CodeTest", "sortable":false, "width":200})
        setColumns(xx)
        console.log(xx)
    }, [waveColumns])

    return columns
}

const AmWaveDetail = (props) => {
    //const waveList = useWaveList(props.waveQuery, props.currentTab);
    const [waveSelection, setWaveSelection] = useState([])
    const waveColumns = useWaveColumns(props.waveColumns)
    
    useEffect(()=> {
        //console.log(waveColumns)
    },[waveColumns])
    //const detailColumns = useDetailColumns(props.detailColumns)

    return <>
        <AmTable columns={waveColumns} data={[]} sortable={false}/>
        <AmTable columns={props.detailColumns} data={[]} sortable={false}/>
    </>
}

export default AmWaveDetail;
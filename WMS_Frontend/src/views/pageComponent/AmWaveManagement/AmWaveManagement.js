import React, { useState, useEffect, useContext } from "react";
import { AmTable } from "../../../components/table";
import AmEditorTable from '../../../components/table/AmEditorTable'
import AmDropdown from "../../../components/AmDropdown";
import AmButton from '../../../components/AmButton'
import {
    apicall,
    createQueryString,
    IsEmptyObject
} from "../../../components/function/CoreFunction2";
import { WaveContext } from './WaveContext';

var Axios = new apicall();

const useWaveColumns = (waveColumns) => {
    const [columns, setColumns] = useState(waveColumns);
    const { wave, tabModes } = useContext(WaveContext)

    const SetWaveID = (es) => {
        wave.setWaveID(es.row._original.ID)
    }

    useEffect(() => {
        let columnsWave = [...waveColumns];
        columnsWave.unshift({
            Header: "",
            width: 110,
            Cell: (es) =>(
                    <AmButton
                        style={{ width: 80,height:30 }}
                        styleType="add"
                          onClick={() => { SetWaveID(es)}}
                >Play</AmButton>
                )
                
        })
        setColumns(columnsWave)
    }, [waveColumns])

    return columns
}

const useWaveQuery = (query, mode) => {
    const [waveQuery, setWaveQuery] = useState(query);
    useEffect(() => {
        if (query != null) {
            let objQuery = { ...query};
            if (objQuery !== null) {
                let getWaveMode = JSON.parse(objQuery.q);
                console.log(getWaveMode)
                getWaveMode.push({ 'f': 'RunMode', 'c': '=', 'v': mode })
                
                objQuery.q = JSON.stringify(getWaveMode);
      
            }
            setWaveQuery(objQuery)
        }


    }, [query, mode])

    return waveQuery;
}



const AmWaveManagement = (props) => {
    const [Datawave, setDatawave] = useState();
    const waveColumns = useWaveColumns(props.waveColumns)
    const { wave, tabModes} = useContext(WaveContext)
    const WavemangeQuery = useWaveQuery(props.waveQuery, wave.waveRunMode)
        //useState(props.WavemangeQuery);
        //useWaveQuery(props.WavemangeQuery, wave.waveRunMode)

    useEffect(() => {
        getData(WavemangeQuery)
        console.log(WavemangeQuery)
    }, [WavemangeQuery])

    const getData = (WavemangeQuerys) => {
     Axios.get(createQueryString(WavemangeQuerys)).then(res => {    
         setDatawave(res.data.datas);
     })
    }

    const DDLWave = [{ label: 'Manual', value: 0 },
        { label: 'Sequence', value: 1},
        { label: 'Schedule', value: 2},
    ]

    const onChangeEditor = (value, dataObject) => {
        wave.setwaveRunMode(value)
    }


    return <>
        <div>
            <AmDropdown
                 id="ModeWave"
                 placeholder="Select"
                 data={DDLWave}
                  width={300} 
                 defaultValue={0}
                 ddlMinWidth={300} 
                 valueData={0} 
                 onChange={(value, dataObject) =>
                     onChangeEditor(value, dataObject)
                 }
                 ddlType={"search"}
            ></AmDropdown>
        </div>
        <AmTable columns={waveColumns} data={Datawave} sortable={false} />
        
    </>
}

export default AmWaveManagement;
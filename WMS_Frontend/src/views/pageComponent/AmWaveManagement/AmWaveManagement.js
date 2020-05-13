import React, { useState, useEffect, useContext } from "react";
import AmTable from "../../../components/AmTable/AmTable";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import AmEditorTable from '../../../components/table/AmEditorTable'
import AmDropdown from "../../../components/AmDropdown";
import AmButton from '../../../components/AmButton'
import AmDialog from '../../../components/AmDialogConfirm'
import AmCheckBox from '../../../components/AmCheckBox'
import styled from 'styled-components';
import {
    apicall,
    createQueryString,
    IsEmptyObject
} from "../../../components/function/CoreFunction2";
import { WaveContext } from './WaveContext';
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import classnames from "classnames";
var Axios = new apicall();

const styles = theme => ({
    root: {
        width: "100%"
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular
    },
    expand: {
        transform: "rotate(0deg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    collapse: {
        transform: "rotate(180deg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    container: {
        width: "100%",
        overflow: "hidden",
        height: "auto",
        background: "red"
    },
    paper: {
        padding: "3px"
    },

    fontIndi_0: {
        color: "#1b5e20",
        minHeight: "70px",
        paddingTop: "5px",
        fontSize: "small",
        fontWeight: "bold"
    },
    fontIndi_1: {
        color: "#01579b",
        minHeight: "52px",
        paddingTop: "5px",
        fontSize: "small",
        fontWeight: "bold"
    },
    indicator_0: { backgroundColor: "#1b5e20" },
    indicator_1: { backgroundColor: "#01579b" }
});

const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
  margin: 5px 0 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;
const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const useWaveColumns = (waveColumns) => {
    const [columns, setColumns] = useState(waveColumns);
    const { wave, tabModes } = useContext(WaveContext)


    const onChanCheckbox = (es, e) => {
        if (e.checked == true) {
            wave.setWaveID(es.data.ID)
        } else if (e.checked == false) {
            wave.setWaveID("")
        }
    }

    useEffect(() => {
        let columnsWave = [...waveColumns];
        columnsWave.unshift({
            Header: "",
            width: 50,
            Cell: (es) => (
                <AmCheckBox
                    onChange={(e) => { onChanCheckbox(es, e) }}
                ></AmCheckBox>
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
            let objQuery = { ...query };
            if (objQuery !== null) {
                let getWaveMode = JSON.parse(objQuery.q);
                getWaveMode.push({ 'f': 'RunMode', 'c': '=', 'v': mode })

                objQuery.q = JSON.stringify(getWaveMode);

            }
            setWaveQuery(objQuery)
        }
    }, [query, mode])

    return waveQuery;
}

const useWaveLocQuery = (areaID, locQury) => {
    const [wavelocQuery, setwavelocQuery] = useState(locQury)
    useEffect(() => {
        if (locQury != null) {
            let objQuery = { ...locQury };
            if (objQuery !== null) {
                let locArea = JSON.parse(objQuery.q);
                locArea.push({ 'f': 'AreaMaster_ID', 'c': '=', 'v': areaID })
                objQuery.q = JSON.stringify(locArea);

            }
            setwavelocQuery(objQuery)
        }

    }, [areaID, locQury])
    return wavelocQuery
}


const AmWaveManagement = (props) => {
    const { classes } = props;
    const [Datawave, setDatawave] = useState([]);
    const waveColumns = useWaveColumns(props.waveColumns)
    const { wave, tabModes } = useContext(WaveContext)
    const WavemangeQuery = useWaveQuery(props.waveQuery, wave.waveRunMode)
    const waveArealocationMasterQuery = useWaveLocQuery(wave.areaID, props.waveArealocationMasterQuery)
    const [currentTab, setCurrentTab] = useState(0);
    const [openDialog, setopenDialog] = useState(false)
    const [checkboxArea, setcheckboxArea] = useState(false)

    useEffect(() => {
        getData(WavemangeQuery)
    }, [WavemangeQuery])


    const getData = (WavemangeQuerys) => {
        Axios.get(createQueryString(WavemangeQuerys)).then(res => {
            setDatawave(res.data.datas);
        })
    }

    const OnchaneTabTop = (e, n) => {
        wave.setwaveRunMode(n)
    }

    const OnchangeWorking = () => {
        setopenDialog(true)
    }

    const onClickConfirmWorkingWave = () => {
        setopenDialog(false)
        console.log(wave.waveID)
        console.log(wave.areaID)
        console.log(wave.areaLoc)
    }

    const Customtub = () => {
        return props.waveCustomtabRunmode.map(row => {
         return <div>
                 <Tab label={row.label} value={row.value} />
              
          </div>

        }) 
    }

    const renderDialog = () => {
        return <div style={{ width: "350px" }}>
            <FormInline>
                <label>Area : </label>
                <div style={{ marginLeft: "70px" }}><AmDropdown
                    id="AreaMaster"
                    // disabled
                    placeholder="Select AreaMaster"
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                    fieldLabel={["Code", "Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                    width={200} //กำหนดความกว้างของช่อง input
                    ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown      
                    defaultValue={2}
                    queryApi={props.waveAreaMasterQuery}
                    onChange={(value) => wave.setareID(value)}
                    ddlType={"search"} //รูปแบบ Dropdown 
                    zIndex={9999}
                    disabled={checkboxArea ? checkboxArea : false}
                ></AmDropdown>
                </div>
            </FormInline>
            <div style={{ marginTop: "10px" }}>
                <FormInline>
                    <label>Area Location : </label>
                    <div style={{ marginLeft: "10px" }}><AmDropdown
                        id="AreaMaster"
                        // disabled
                        placeholder="Select AreaLocationMaster"
                        fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        fieldLabel={["Code", "Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        width={200} //กำหนดความกว้างของช่อง input
                        ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown      
                        //defaultValue={2}
                        queryApi={waveArealocationMasterQuery}
                        onChange={(value) => wave.setareaLoc(value)}
                        ddlType={"search"} //รูปแบบ Dropdown 
                        zIndex={9999}
                        disabled={checkboxArea ? checkboxArea : false}
                    ></AmDropdown></div>
                </FormInline>
            </div>
            <FormInline>
                <label> Not Send Area : </label>
                <AmCheckBox
                    style={{ marginLeft: "80px" }}
                    onChange={(e) => { setcheckboxArea(e.checked) }}
                ></AmCheckBox>
            </FormInline>
        </div>
    }

    return <>
        <div style={{ marginBottom: "10px" }}>

            {props.waveCustomtabRunmode ? <Paper square> <Tabs value={currentTab} onChange={(e, n) => OnchaneTabTop(e, n)}>
                {Customtub()}
            </Tabs></Paper> : <Paper square> <Tabs              
                    value={currentTab}
                    scrollButtons="on"
                   
                onChange={(e, n) => OnchaneTabTop(e, n)}>
                    <Tab label="Manual"
                        className={classes.fontIndi_0}
                        value={0} />
                    <Tab label="Sequence" value={1} />
                    <Tab label="Schedule" value={2} />

                </Tabs></Paper>}
        </div>
        <div style={{ marginBottom: "10px" }}>
            <AmTable
                columns={waveColumns}
                //data={Datawave}
                sortable={false}
                dataSource={Datawave}
            />
        </div>
        <AmButton
            styleType="warning"
            onClick={() => OnchangeWorking()}
        >{"Working"}</AmButton>

        <div>
            < AmDialog
                styleDialog={{ maxWidth: "800px" }}
                open={openDialog}
                close={a => { setopenDialog(!openDialog) }}
                bodyDialog={props.waveDialog ? renderDialog() : []}
                customAcceptBtn={
                    <AmButton
                        styleType="confirm_clear"
                        onClick={() => {
                            onClickConfirmWorkingWave();
                        }}>OK</AmButton>
                }
                customCancelBtn={
                    <AmButton
                        styleType="delete_clear"
                        onClick={() => {
                            setopenDialog(!openDialog)
                        }}>Cancel</AmButton>
                }
            >
            </ AmDialog>
        </div>
    </>
}

AmWaveManagement.propTypes = {
    classes: PropTypes.object.isRequired
};


export   default withStyles(styles)(AmWaveManagement);
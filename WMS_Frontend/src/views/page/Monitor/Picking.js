import React, { useState, useEffect, useContext } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'
import classNames from 'classnames';
import Axios from 'axios';
import AmDashboard from '../../pageComponent/AmDashboard';
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction2'
import AmIconStatus from "../../../components/AmIconStatus";
import AmDropdown from '../../../components/AmDropdown';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import logo from '../../../assets/logo/logo.png'
import Fullscreen from "react-full-screen";
import AmButton from "../../../components/AmButton";
import IconButton from '@material-ui/core/IconButton';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    content: {
        marginBottom: 10
    },
    inlineTitle: {
        display: 'flex',
        fontWeight: 'bold',
        alignItems: 'center',
        verticalAlign: 'middle',
        textAlign: 'right'
    },
    div: {
        justifyContent: 'right'
    },
    spacing: {
        marginRight: '5px',
    },
});

const WorkingOutselect = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "r_DashboardMoveOut",
    q: "[{ 'f': 'IOType', 'c': '=', 'v': 1 },{ 'f': 'AreaID', 'c': 'in', 'v': '2,3' }]",
    f: "ID,Time,Document_Code,AreaID,AreaLoc_Code,Base_Code,Pack_Code,Pack_Name,Product,Destination,MVT,SAPRef,QtyUnit,EventStatus",
    g: "",
    s: "[{'f':'Status','od':'asc'},{'f':'IIF(Status = 1, Time, null)','od':'asc'},{'f':'IIF(Status = 3, Time, null)','od':'desc'}]",
    sk: 0,
    l: 20,
    all: "",
}
const WorkQselect = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI",
    t: "WorkQueue",
    // q: '',
    q: "[{ 'f': 'IOType', 'c': '=', 'v': 1 }]",
    f: "ID,ActualTime",
    g: "",
    s: "[{'f':'ActualTime','od':'desc'}]",
    sk: 0,
    l: 1,
    all: "",
}

const StoSelect = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI",
    t: "StorageObject",
    // q: '',
    q: "[{ 'f': 'AreaMaster_ID', 'c': 'in', 'v': '8,9' }]",
    f: "ID,isnull(ModifyTime, CreateTime) AS ActualTime",
    g: "",
    s: "[{'f':'ActualTime','od':'desc'}]",
    sk: 0,
    l: 1,
    all: "",
}
const cols = [
    { accessor: "Time", Header: "Time", width: 110, className: 'center', type: "time", sortable: false },
    { accessor: "AreaLoc_Code", Header: "Gate", className: 'center', width: 100, style: { fontWeight: '900' }, sortable: false },
    { accessor: "MVT", Header: "Mvt.", width: 100, className: 'center', sortable: false },
    { accessor: "Base_Code", Header: "Pallet", width: 160, sortable: false },
    { accessor: "Product", Header: "Product", sortable: false },
    { accessor: "QtyUnit", Header: "Qty", width: 140, className: 'right', style: { fontWeight: '900' }, sortable: false },
    { accessor: "Destination", Header: "Destination", width: 170, sortable: false },
    { accessor: "Document_Code", Header: "Doc No.", width: 160, sortable: false },
    { accessor: "SAPRef", Header: "SAP.Doc No.", width: 160, sortable: false },
]
const cols2 = [
    { accessor: "Time", Header: "Time", width: 110, className: 'center', type: "time", sortable: false },
    {
        accessor: "TaskName", Header: "Task", width: 130, className: 'center', sortable: false,
        Cell: row => (
            <AmIconStatus styleType={row.value} style={{ fontSize: '1em', fontWeight: '600' }}>{row.value}</AmIconStatus>
        )
    },
    { accessor: "LocationCode", Header: "Stage", width: 70, style: { fontWeight: '900' }, sortable: false },
    { accessor: "PalletCode", Header: "Pallet", width: 160, sortable: false },
    { accessor: "Product", Header: "Product", sortable: false },
    { accessor: "Qty", Header: "Qty", width: 140, className: 'right', style: { fontWeight: '900' }, sortable: false },
    { accessor: "Destination", Header: "Destination", width: 170, sortable: false },
    { accessor: "DocNo", Header: "Doc No.", width: 160, sortable: false },
    { accessor: "SAPRef", Header: "SAP.Doc No.", width: 160, sortable: false },
]
const optionsArea = [
    { value: '0', label: 'All Area' },
    { value: '2', label: 'Front Area' },
    { value: '3', label: 'Rear Area' }
];
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
  
    useEffect(() => {
      const handleResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
      };
      window.addEventListener("resize", handleResize);
  
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });
  
    return { width, height };
  };
function PickingProgress(props) {
    const { classes, location, history } = props;
    //r_DashboardMoveOut
    const [queryWorkQ, setQueryWorkQ] = useState(null);
    // const [queryWorkQCheck, setQueryWorkQCheck] = useState(null);

    //spname=DASHBOARD_TASK_ON_FLOOR
    const [stoSPTaskonFloor, setStoSPTaskonFloor] = useState(null);
    // const [queryStoObjCheck, setQueryStoObjCheck] = useState(null);

    const [areaIDMoveOut, setAreaIDMoveOut] = useState("2,3");
    const [areaIDOnFloor, setAreaIDOnFloor] = useState("8,9");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [calHeight, setCalHeight] = useState(0.65);
    const { width, height } = useWindowWidth();

    document.title = "Picking Progress : AMW";

    useEffect(() => {
        console.log(areaIDMoveOut);
        let queryApiWorkingOut = Clone(WorkingOutselect);
        queryApiWorkingOut.q = "[{ 'f': 'IOType', c:'=', 'v': 1},{ 'f': 'AreaID', c:'in', 'v': '" + areaIDMoveOut + "'}]";
        setQueryWorkQ(queryApiWorkingOut);

    }, [areaIDMoveOut]);

    useEffect(() => {
        console.log(areaIDOnFloor);
        let stoSP = window.apipath + "/api/report/sp?apikey=FREE01&AreaIDs=" + areaIDOnFloor
            + "&spname=DASHBOARD_TASK_ON_FLOOR";
        setStoSPTaskonFloor(stoSP);

    }, [areaIDOnFloor]);
    const goFull = () => {
        setIsFullScreen(true);
        setCalHeight(0.6);
    }
    const goMin = () => {
        setIsFullScreen(false);
        setCalHeight(0.65);
    }
    const onHandleDDLChange = (value, dataObject, inputID, fieldDataKey) => {
        if (value) {
            setAreaIDMoveOut(value);
            if (value === '2') {
                setAreaIDOnFloor('8');
            } else if (value === '3') {
                setAreaIDOnFloor('9');
            } else {
                setAreaIDMoveOut("2,3");
                setAreaIDOnFloor("8,9");
            }
        } else {
            setAreaIDMoveOut("2,3");
            setAreaIDOnFloor("8,9");
        }
    };
    return (
        <>
            <Fullscreen
                enabled={isFullScreen}
                onChange={isFull => setIsFullScreen(isFull)}
            >
                <div style={isFullScreen ? { backgroundColor: '#e4e7ea', height: height, width: width, padding: '1em 1.8em 1.8em 2em' } : {}} className="fullscreen">

                    <div className={classes.root}>
                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="stretch"
                            className={classes.content}
                        >
                            <Grid item xs={12} sm={6} md={6} xl={6}>
                                <Grid
                                    container
                                    direction="row"
                                    justify="flex-start"
                                    alignItems="center"
                                >
                                    <img style={{ width: "5em" }} src={logo} />
                                </Grid>

                            </Grid>
                            <Grid item xs={12} sm={6} md={6} xl={6}>
                                <Grid
                                    container
                                    direction="row"
                                    justify="flex-end"
                                    alignItems="center"
                                >
                                    <Grid item xs={3} sm={2} md={1} xl={1}>
                                        <Typography className={classNames(classes.inlineTitle, classes.spacing)} style={{ fontSize: "1em", marginRight: "5px" }}>Area:</Typography>
                                    </Grid>
                                    <Grid item xs={9} sm={4} md={5} xl={5} >
                                        <AmDropdown
                                            id="ddlArea"
                                            placeholder="Select Area"
                                            data={optionsArea}
                                            defaultValue={"0"}
                                            onChange={onHandleDDLChange}
                                            ddlType={"normal"} />
                                    </Grid>
                                    <Grid item >
                                        <IconButton style={{ marginLeft: 5, padding: 4 }} onClick={isFullScreen ? goMin : goFull}>
                                            {isFullScreen ?
                                                <FullscreenExitIcon fontSize="large" />
                                                : <FullscreenIcon fontSize="large" />
                                            }
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                    <AmDashboard
                        queryApi={queryWorkQ}
                        queryApiCheck={WorkQselect}
                        columns={cols}
                        pageSize={20}
                        currentPage={0}
                        minRows={6}
                        style={{
                            background: 'white',
                            fontSize: 'calc(0.5em + 1vw)',
                            maxHeight: `${height - (height * calHeight)}px`,
                            // fontWeight: '700', 
                            zIndex: 0
                        }}
                        sort={false}
                        getTrProps={(state, rowInfo) => {
                            let result = false
                            let rmv = false
                            let classStatus = ""
                            if (rowInfo && rowInfo.row) {
                                result = true
                                if (rowInfo.original.EventStatus === 11 || rowInfo.original.EventStatus === 12) {
                                    rmv = true
                                    classStatus = "working"
                                } else if (rowInfo.original.EventStatus === 31 || rowInfo.original.EventStatus === 32) {
                                    rmv = true
                                    classStatus = "inqueue"
                                } else { rmv = false }
                            }
                            if (result && rmv)
                                return { className: classStatus }
                            else
                                return {}
                        }}
                    />

                    <br />
                    <AmDashboard
                        queryApi={stoSPTaskonFloor}
                        apiType={"sp"}
                        queryApiCheck={StoSelect}
                        columns={cols2}
                        pageSize={20}
                        currentPage={0}
                        minRows={6}
                        style={{
                            background: 'white',
                            fontSize: 'calc(0.5em + 1vw)',
                            maxHeight: `${height - (height * calHeight)}px`,
                            // fontWeight: '700', 
                            zIndex: 0
                        }}
                        sort={false}
                    />
                </div>
            </Fullscreen>
        </>
    );

}
PickingProgress.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(PickingProgress);
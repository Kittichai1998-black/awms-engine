import Axios from 'axios'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Fullscreen from "react-full-screen";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'

// import Typography from '@material-ui/core/Typography';

import AmAux from './AmAux';
import AmTable from './AmTable/AmTableComponent'
import { useTranslation } from 'react-i18next'


// import { log } from "util";

// const funcClock2 = (propTime) => {
//     const [time, setTime] = useState(propTime.label + Moment().format(propTime.format));
//     useEffect(() => {//WillUnmount
//         var timerID = setInterval(() => tick(), 1000);
//         return () => {
//             clearInterval(timerID);
//         };
//     }, []);
//     function tick() {
//         setTime(propTime.label + Moment().format(propTime.format));
//     }
//     return time
// }


const useClock = (propsTime, t) => {
    const [date, setDate] = useState()
    const [time, setTime] = useState()

    useEffect(() => {
        Axios.get(window.apipath + "/v2/time").then((res) => {
            if (res) {
                setDate({
                    dateClient: new Date(),
                    dateServer: new Date(res.data.dbTime + "+07:00"),
                });
            }
        })
    }, [])

    useEffect(() => {
        if (date) {
            var timerID = setInterval(() => runningCurrentDate(), 250);
            return () => {
                clearInterval(timerID);
            };
        }
    }, [date, localStorage.getItem("Lang")])

    useEffect(() => {
        if (date)
            runningCurrentDate()
    }, [localStorage.getItem("Lang")])

    const runningCurrentDate = () => {
        let currentDateTime = new Date(date.dateServer.getTime() + (new Date().getTime() - date.dateClient.getTime())),
            label = propsTime.label ? t(propsTime.label) + " : " : ""
        setTime(label + Moment(currentDateTime).format(propsTime.format))
    }
    return time
}

// const useWindowWidth = () => {
//     const [width, setWidth] = useState(window.innerWidth);
//     const [height, setHeight] = useState(window.innerHeight);
//     useEffect(() => {
//         const handleResize = () => {
//             setWidth(window.innerWidth);
//             setHeight(window.innerHeight);
//         };
//         window.addEventListener("resize", handleResize);
//         return () => {
//             window.removeEventListener("resize", handleResize);
//         };
//     });
//     return { width, height };
// };

const AmMonitor = props => {
    const { t } = useTranslation()
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [calHeight, setCalHeight] = useState(0.35);
    const clock = useClock(props.time, t)

    const width_height = useWindowSize(isFullScreen);

    function useWindowSize(full) {
        const [size, setSize] = useState({width:0, height:0});
        useLayoutEffect(() => {
            function updateSize() {
                setSize({width:window.innerWidth, height:window.innerHeight}); 
            }
            window.addEventListener('resize', updateSize);
            updateSize();
            return () => window.removeEventListener('resize', updateSize)
        }, []);

        useEffect(() => {
            
            function updateSize() {
                setSize({width:window.innerWidth, height:window.innerHeight}); 
            }
            updateSize();
        }, [full]);
        return size;
    }

    useEffect(() => {
        if (document.fullscreenElement === null && isFullScreen){
            setIsFullScreen(false)
        }
    }, [document.fullscreenElement])
    

    const time = props.time ? clock : null

    const goFull = () => {
        setIsFullScreen(true);
        openFullscreen();
        setCalHeight(0.4);
    }
    const goMin = () => {
        setIsFullScreen(false);
        closeFullscreen();
        setCalHeight(0.35);
    }

    const formatDatas = (headerCol) => {
        const result = headerCol.map(data => {
            if (data.type) {
                let newData = { ...data }
                if (data.type === "time" || data.type === "datelog" || data.type === "datetime")
                    newData = { ...newData, Cell: (e) => e.value ? datetimeBody(e.value, data.type) : "" }
                if (data.type === "priority")
                    newData = { ...newData, Cell: (e) => e.value ? priorityFormat(e.value) : "" }
                return newData
            } else {
                return { ...data }
            }
        });
        return result;
    }
    const datetimeBody = (value, format) => {
        if (value !== null) {
            const date = Moment(value);
            if (format === "time") {
                return <div>{date.format('HH:mm:ss')}</div>
            } else if (format === "datelog") {
                return <div>{date.format('DD/MM/YYYY HH:mm:ss')}</div>
            } else if (format === "datetime") {
                return <div>{date.format('DD/MM/YYYY HH:mm')}</div>
            }
        }
    }

    const priorityFormat = (val) => {
        switch (val) {
            case 0:
                return "Very Low";
            case 1:
                return "Low";
            case 2:
                return "Normal";
            case 3:
                return "High";
            case 4:
                return "Very High";
            case 5:
                return "Critical";
            default:
                return "";
        }
    }

    const checkStatus = (rowInfo) => {
        let classStatus = ""
        if (rowInfo && rowInfo.row) {
            classStatus = rowInfo.original.StyleStatus;
            // if (rowInfo.original.Status === 3) {
            //     classStatus = "normal"
            // } else if (rowInfo.original.Status === 1 || rowInfo.original.Status === 0) {
            //     classStatus = "working"
            // }
        }
        if (classStatus)
            return { className: classStatus }
        else
            return {}
    }
    const checkStatusColor = (rowInfo) => {
        if (rowInfo.StyleStatus === "normal") {
            return { backgroundColor: "white", lineHeight: "35px" }
        } else if (rowInfo.StyleStatus === "working") {
            return { backgroundColor: "rgb(255, 207, 61)", lineHeight: "35px" }
        } else {
            return { backgroundColor: "white", lineHeight: "35px" }
        }

    }
    
    function openFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
            document.documentElement.msRequestFullscreen();
        }
      }

      function closeFullscreen() {
        if (window.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
      }

    const table = props.coltable.map((x, xi) => {
        if (x.length === 1) {
            return (
                <Grid container key={xi}>
                    <b>{x[0].table[0].title ? x[0].table[0].title : null}</b>
                    <Grid item md={12}>
                        <AmTable
                            // primaryKey="ID"
                            dataSource={x[0].table[0].data}
                            columns={formatDatas(x[0].table[0].headercol)}
                            pageSize={20}
                            minRows={6}
                            currentPage={0}
                            cellStyle={(accessor, cellData, dataSource) => { return checkStatusColor(dataSource) }}
                            getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                            style={{
                                background: 'white',
                                fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                maxHeight: props.coltable.length === 1 ? (width_height.height * calHeight) * 2 : width_height.height * calHeight,
                                // fontWeight: '700', 
                                zIndex: 0
                            }}
                        />
                    </Grid>
                </Grid>
            )
        } else {
            return (
                <Grid container key={xi}>
                    {x.map((y, yi) => {
                        if (y.table.length === 1) {
                            return (
                                <Grid item md={6} key={yi}>
                                    <AmTable
                                        // primaryKey="ID"
                                        dataSource={y.table[0].data}
                                        columns={formatDatas(y.table[0].headercol)}
                                        pageSize={20}
                                        minRows={6}
                                        currentPage={0}
                                        cellStyle={(accessor, cellData, dataSource) => { return checkStatusColor(dataSource) }}
                                        getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                                        style={{
                                            background: 'white',
                                            fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                            maxHeight: props.coltable.length === 1 || (x.length === 2 && y.type === "row") ? (width_height.height * calHeight) * 2 : width_height.height * calHeight,
                                            // fontWeight: '700', 
                                            zIndex: 0
                                        }}
                                    />
                                </Grid>
                            )
                        } else {
                            if (y.type === "col") {
                                return (
                                    <Grid item md={6} key={yi} container direction="row">
                                        {y.table.map((z, zi) => {
                                            return (
                                                <Grid item md={6} key={yi}>
                                                    <AmTable
                                                        key={zi}
                                                        // primaryKey="ID"
                                                        dataSource={z.data}
                                                        columns={formatDatas(z.headercol)}
                                                        pageSize={20}
                                                        minRows={6}
                                                        currentPage={0}
                                                        cellStyle={(accessor, cellData, dataSource) => { return checkStatusColor(dataSource) }}
                                                        getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                                                        style={{
                                                            background: 'white',
                                                            fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                                            maxHeight: y.type === "col" && props.coltable.length === 1 ? (width_height.height * calHeight) * 2 : width_height.height * calHeight,
                                                            // fontWeight: '700', 
                                                            zIndex: 0
                                                        }}
                                                    />
                                                </Grid>
                                            )
                                        })}
                                    </Grid>
                                )
                            } else if (y.type === "row") {
                                return (
                                    <Grid item md={6} key={yi}>
                                        {y.table.map((z, zi) => {
                                            return (
                                                <AmTable
                                                    key={zi}
                                                    // primaryKey="ID"
                                                    dataSource={z.data}
                                                    columns={formatDatas(z.headercol)}
                                                    pageSize={20}
                                                    minRows={6}
                                                    currentPage={0}
                                                    cellStyle={(accessor, cellData, dataSource) => { return checkStatusColor(dataSource) }}
                                                    getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                                                    style={{
                                                        background: 'white',
                                                        fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                                        maxHeight: width_height.height * calHeight,
                                                        // fontWeight: '700', 
                                                        zIndex: 0
                                                    }}
                                                />
                                            )
                                        })}
                                    </Grid>
                                )
                            }
                        }
                    })}
                </Grid>
            )
        }
    })

    const dropdown = props.dropdown ? (
        <AmAux>
            <Grid item xs={3} sm={2} md={3} xl={1}>
                <label style={{ fontSize: 'calc(0.5em + 1vw)', fontWeight: 'bold', marginRight: "5px" }}>{t(props.dropdown.label) + " :"}</label>
            </Grid>
            <Grid item xs={9} sm={4} md={4} xl={5} >
                {props.dropdown.dropdown}
            </Grid>
        </AmAux>
    ) : null

    return (
        <div style={isFullScreen ? { width:"100%", height:"100%", position:"absolute", top:0, left:0, zIndex:999999 } : {}}>
            <div style={isFullScreen ? { backgroundColor: '#e4e7ea', height: width_height.height, width: width_height.width, padding: '1em 1.8em 1.8em 2em' } : {}} className="fullscreen">
                <Grid container direction="row" justify="flex-start" alignItems="stretch" >
                    <Grid item xs={12} sm={6} md={6} xl={6}>
                        <Grid container direction="row" justify="flex-start" alignItems="center">
                            <label style={{ marginTop: 7, marginBottom: 3, fontSize: 'calc(0.5em + 1.5vw)', fontWeight: 'bold' }}>{time}</label>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={6}>
                        <Grid container direction="row" justify="flex-end" alignItems="center" >
                            {dropdown}
                            <Grid item >
                                <IconButton style={{ marginLeft: 5, padding: 4 }} onClick={isFullScreen ? goMin : goFull}>
                                    {isFullScreen ?
                                        <FullscreenExitIcon style={{ fontSize: 'calc(0.75em + 1.25vw)' }} />
                                        : <FullscreenIcon style={{ fontSize: 'calc(0.75em + 1.25vw)' }} />
                                    }
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                {table}
            </div>
        </div>
    );
}

AmMonitor.propTypes = {
    time: PropTypes.object,
    dropdown: PropTypes.object,
    coltable: PropTypes.array.isRequired,
}

export default AmMonitor
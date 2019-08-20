import Axios from 'axios'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Fullscreen from "react-full-screen";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react'

// import Typography from '@material-ui/core/Typography';

import AmAux from './AmAux';
import AmTable from './table/AmTable'
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
        let currentDateTime = new Date(date.dateServer.getTime() + (new Date().getTime() - date.dateClient.getTime()));
        setTime(t(propsTime.label) + " : " + Moment(currentDateTime).format(propsTime.format))
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

const AmPageDashboard = props => {
    const { t } = useTranslation()
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [calHeight, setCalHeight] = useState(0.65);
    const clock = useClock(props.time, t)

    const [width_height, set_width_height] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })
    // const [height,setHeight] = useState(window.innerHeight)
    // const { width, height } = useWindowWidth();
    const time = props.time ? clock : null

    useEffect(() => {
        setTimeout(() => {
            set_width_height({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }, 20);
    }, [isFullScreen])

    const goFull = () => {
        setIsFullScreen(true);
        setCalHeight(0.6);
    }
    const goMin = () => {
        setIsFullScreen(false);
        setCalHeight(0.65);
    }

    const formatTime = (headerCol) => {
        const result = headerCol.map(data => {
            if (data.type) {
                if (data.type === "time" || data.type === "datelog" || data.type === "datetime") {
                    return (
                        { ...data, Cell: (e) => e.value ? datetimeBody(e.value, data.type) : "" }
                    )
                }
            } else {
                return (
                    { ...data }
                )
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
                return <div>{date.format('DD-MM-YYYY HH:mm:ss')}</div>
            } else if (format === "datetime") {
                return <div>{date.format('DD-MM-YYYY HH:mm')}</div>
            }
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

    const table = props.coltable.map((x, xi) => {
        if (x.length === 1) {
            return (
                <Grid container key={xi}>
                    <Grid item md={12}>
                        <AmTable
                            // primaryKey="ID"
                            data={x[0].table[0].data}
                            columns={formatTime(x[0].table[0].headercol)}
                            pageSize={20}
                            minRows={6}
                            currentPage={0}
                            getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                            style={{
                                background: 'white',
                                fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                maxHeight: props.coltable.length === 1 ? (width_height.height - (width_height.height * calHeight)) * 2 : width_height.height - (width_height.height * calHeight),
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
                                        data={y.table[0].data}
                                        columns={formatTime(y.table[0].headercol)}
                                        pageSize={20}
                                        minRows={6}
                                        currentPage={0}
                                        getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                                        style={{
                                            background: 'white',
                                            fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                            maxHeight: props.coltable.length === 1 || (x.length === 2 && y.type === "row") ? (width_height.height - (width_height.height * calHeight)) * 2 : width_height.height - (width_height.height * calHeight),
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
                                                        data={z.data}
                                                        columns={formatTime(z.headercol)}
                                                        pageSize={20}
                                                        minRows={6}
                                                        currentPage={0}
                                                        getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                                                        style={{
                                                            background: 'white',
                                                            fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                                            maxHeight: y.type === "col" && props.coltable.length === 1 ? (width_height.height - (width_height.height * calHeight)) * 2 : width_height.height - (width_height.height * calHeight),
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
                                                    data={z.data}
                                                    columns={formatTime(z.headercol)}
                                                    pageSize={20}
                                                    minRows={6}
                                                    currentPage={0}
                                                    getTrProps={(state, rowInfo) => checkStatus(rowInfo)}
                                                    style={{
                                                        background: 'white',
                                                        fontSize: isFullScreen ? 'calc(0.5em + 1vw)' : "",
                                                        maxHeight: width_height.height - (width_height.height * calHeight),
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
        <Fullscreen enabled={isFullScreen} onChange={isFull => setIsFullScreen(isFull)}>
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
        </Fullscreen>
    );
}

AmPageDashboard.propTypes = {
    time: PropTypes.object,
    dropdown: PropTypes.object,
    coltable: PropTypes.array.isRequired,
}

export default AmPageDashboard
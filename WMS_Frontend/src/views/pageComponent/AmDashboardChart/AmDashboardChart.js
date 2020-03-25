import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import AmChart from './AmChart';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Fullscreen from "react-full-screen";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { useTranslation } from 'react-i18next'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Moment from 'moment';
import Axios from 'axios'

const styles = theme => ({
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});
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


const DashboardChartComponent = (props) => {
    const { t } = useTranslation()
    const timeDefault = {
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        // label: "Date/Time"
    }
    const {
        classes,
        time = timeDefault,
        chartConfigs,
    } = props;

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [calHeight, setCalHeight] = useState(0.35);
    const clock = useClock(time, t)

    const [width_height, set_width_height] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })
    const time_show = time ? clock : null

    const [chartCreateShow, setChartCreateShow] = useState(null);
 

    useEffect(() => {
        setTimeout(() => {
            set_width_height({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }, 30);
    }, [isFullScreen])

    const goFull = () => {
        setIsFullScreen(true);
        setCalHeight(0.4);
    }
    const goMin = () => {
        setIsFullScreen(false);
        setCalHeight(0.35);
    }

    const CreateChart = (charts) => {
        console.log(charts)

        return charts.map((row, index) => {

            if (row.length === 1) {
                return (
                    <Grid container key={index}>

                        {row.map((x, col) => {

                            console.log("chart" + col.toString())
                            return (
                                <Grid item md={12} key={col}>
                                    {x.title ? <Typography className={classes.title} gutterBottom>{x.title}</Typography> : null}
                                    {GenerateChart(x)}
                                </Grid>
                            )
                        })}
                    </Grid>
                )
            } else {
                console.log("สร้างmulti-chart" + index.toString())
                return (
                    <Grid container key={index}>
                        {row.map((x, col) => {
                            console.log("chart" + col.toString())

                            return (
                                <Grid item md={6} key={col}>
                                    {x.title ? <Typography className={classes.title} gutterBottom>{x.title}</Typography> : null}
                                    {GenerateChart(x)}
                                </Grid>

                            )
                        })}
                    </Grid>

                )
            }
        });
    };

    const GenerateChart = (configs) => {
        // console.log(configs.customPlugins)
        // if (configs.type === 'pie' || 'doughnut') {
        //     return <AmChartPie
        //         chartConfig={configs.chart} 
        //     />
        // } else if (configs.type === 'line') {
        //     return <AmChartLine
        //         chartConfig={configs.chart}  
        //     />
        // } else if (configs.type === 'bar') {
        //     return <AmChartBar
        //         chartConfig={configs.chart}  
        //     />
        // } else {
        //     return null;
        // }
        if (configs) {
            return <AmChart
                chartConfig={configs.chart}
            />
        } else {
            return null;
        }
    }
    useEffect(() => {
        if (chartConfigs) {
            const newChartCreateShow = CreateChart(chartConfigs);
            setChartCreateShow(newChartCreateShow);
        }
    }, [chartConfigs]);
    return (
        <Fullscreen enabled={isFullScreen} onChange={isFull => setIsFullScreen(isFull)}>
            <div style={isFullScreen ? { backgroundColor: '#e4e7ea', height: width_height.height, width: width_height.width, padding: '1em 1.8em 1.8em 2em' } : {}} className="fullscreen">
                <Grid container direction="row" justify="flex-start" alignItems="stretch" >
                    <Grid item xs={12} sm={6} md={6} xl={6}>
                        <Grid container direction="row" justify="flex-start" alignItems="center">
                            <label style={{ marginTop: 7, marginBottom: 3, fontSize: 'calc(0.5em + 1.5vw)', fontWeight: 'bold' }}>{time_show}</label>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={6}>
                        <Grid container direction="row" justify="flex-end" alignItems="center" >
                            {/* {dropdown} */}
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
                {chartCreateShow}
            </div>
        </Fullscreen>
    );

}

DashboardChartComponent.propTypes = {
    time: PropTypes.object,
    chartConfig: PropTypes.object,
    chartConfigs: PropTypes.array.isRequired
}

export default withStyles(styles)(DashboardChartComponent)
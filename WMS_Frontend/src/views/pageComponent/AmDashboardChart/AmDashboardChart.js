import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import AmChartBar from './AmChartBar';
import AmChartPie from './AmChartPie';
import AmChartLine from './AmChartLine';
import AmChartTable from './AmChartTable';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Fullscreen from "react-full-screen";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { useTranslation } from 'react-i18next'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Clone from "../../../components/function/Clone";
import _ from 'lodash'
import Moment from 'moment';
import Axios from 'axios'
// import Pdf from "react-to-pdf";
import AmButton from "../../../components/AmButton";
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import classNames from 'classnames';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ref = React.createRef();

const styles = theme => ({
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    paddingGrid: {
        paddingRight: '15px'
    },
    leftIcon: {
        marginRight: theme.spacing(),
    },
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
const options = {
    orientation: 'landscape',
    unit: "cm",
    format: [890, 720]  //3508 x 2480
};
const DashboardChartComponent = (props) => {
    const { t } = useTranslation()
    const timeDefault = {
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        // label: "Date/Time"
    }
    const {
        classes,
        time = timeDefault,
        showTime = false,
        chartConfigs,
        delay
    } = props;

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [calHeight, setCalHeight] = useState(0.35);
    const clock = useClock(time, t)

    const [width_height, set_width_height] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })
    const time_show = showTime && time ? clock : null

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

        return charts.map((row, index) => {
            if (row.length === 1) {
                return (
                    <Grid container key={index}>
                        {row.map((x, col) => {
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
                return (
                    <Grid container key={index} style={{ paddingTop: '10px' }}>
                        {row.map((x, col) => {
                            return (
                                <Grid item md={6} key={col} className={classes.paddingGrid}>
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
        if (configs) {
            if (configs.type === 'bar' || configs.type === 'horizontalBar') {
                return <AmChartBar
                    chartConfig={configs}
                />
            } else if (configs.type === 'pie' || configs.type === 'doughnut') {
                return <AmChartPie
                    chartConfig={configs}
                />
            } else if (configs.type === 'line') {
                return <AmChartLine
                    chartConfig={configs}
                />
            } else if (configs.type === 'table') {
                return <AmChartTable
                    chartConfig={configs}
                />
            }
        } else {
            return null;
        }
    }

    useEffect(() => {
        if (chartConfigs !== undefined && chartConfigs !== null && chartConfigs.length > 0) {
            // console.log(chartConfigs)
            const newChartCreateShow = CreateChart(chartConfigs);
            setChartCreateShow(newChartCreateShow);
        }
    }, [chartConfigs]);

    const printDocument = () => {
        const input = document.getElementById('chartShow');
        html2canvas(input)
            .then((canvas) => {
               
                let canvaswidth = parseInt(canvas.width);
                let canvasheight = parseInt(canvas.height);
                // console.log(canvas)

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF("l","mm","a4")
                // const pdf = new jsPDF({
                //     orientation: 'landscape',
                //     unit: 'pt',
                //     format: [canvaswidth, canvasheight]
                // });

                // let width = parseInt(canvas.width);
                // let height = parseInt(canvas.height);
                
                pdf.addImage(imgData, 'JPEG', 20, 25, 260, 130);
                pdf.save("Dashboard.pdf");
            })
            ;
    }


    return (
        // <Fullscreen enabled={isFullScreen} onChange={isFull => setIsFullScreen(isFull)}>
        // <div style={isFullScreen ? { backgroundColor: '#e4e7ea', height: 'inherit', width: width_height.width, padding: '1em 1.8em 1.8em 2em' } : {}} className="fullscreen">
        <>
            <Grid container direction="row" justify="flex-start" alignItems="stretch" >
                <Grid item xs={12} sm={6} md={6} xl={6}>
                    <Grid container direction="row" justify="flex-start" alignItems="center">
                        <label style={{ marginTop: 7, marginBottom: 3, fontSize: 'calc(0.5em + 1.5vw)', fontWeight: 'bold' }}>{time_show}</label>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6} md={6} xl={6}>
                    <Grid container direction="row" justify="flex-end" alignItems="center" >
                        <Grid item >
                            {/* <IconButton style={{ marginLeft: 5, padding: 4 }} onClick={isFullScreen ? goMin : goFull}>
                                    {isFullScreen ?
                                        <FullscreenExitIcon style={{ fontSize: 'calc(0.75em + 1.25vw)' }} />
                                        : <FullscreenIcon style={{ fontSize: 'calc(0.75em + 1.25vw)' }} />
                                    }
                                </IconButton> */}
                            {/* <Pdf targetRef={ref} filename="code-example.pdf" options={options} x={1} y={.5} scale={1}>
                                {({ toPdf }) =>
                                    // <button onClick={toPdf}>Generate Pdf</button>
                                    <AmButton styleType="default_clear"  onClick={toPdf}
                                        startIcon={<PictureAsPdfIcon  />}>
                                        {'Export PDF'}
                                    </AmButton>
                                }
                            </Pdf> */}
                            <AmButton styleType="default_clear" onClick={printDocument}
                                startIcon={<PictureAsPdfIcon />}>
                                {'Export PDF'}
                            </AmButton>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
            <div ref={ref} id="chartShow" >
                {chartCreateShow}
            </div>
        </>
        // </Fullscreen>
    );

}

DashboardChartComponent.propTypes = {
    time: PropTypes.object,
    chartConfigs: PropTypes.array.isRequired,
    delay: PropTypes.number
}
DashboardChartComponent.defaultProps = {
    delay: 1000,
}

export default withStyles(styles)(DashboardChartComponent)
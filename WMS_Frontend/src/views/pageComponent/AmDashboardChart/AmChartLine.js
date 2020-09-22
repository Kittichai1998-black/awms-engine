import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
import datalabels from 'chartjs-plugin-datalabels';
import { apicall } from '../../../components/function/CoreFunction'
const Axios = new apicall();

const GenerateChart = props => {
    const {
        classes,
        chartConfig,

    } = props;

    const chartContainer = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);

    useEffect(() => {
        if (chartContainer && chartContainer.current) {

            const res = Axios.get(window.apipath + "/v2/GetSPReportAPI?&spname="
                + chartConfig.spname)
                .then(res => {
                    if (res.data.datas) {

                        let datas = res.data.datas;
                        // console.log(datas)

                        let labels = datas.map(e => e.labels)

                        let datasets = []

                        let datalist = []
                        for (var key in datas[0]) {
                            if (key.substring(key.length - 2, key.length - 1) === '_') {
                                datalist.push(key.substring(key.length - 1, key.length))
                            }
                        }
                        let numDatasets = new Set([...datalist]);
                        for (let item of numDatasets) {
                            let _label = datas[0]['label_' + item] ? datas[0]['label_' + item] : '';

                            let _data = [];
                            let _typeData = datas[0]['typeData_' + item] ? datas[0]['typeData_' + item] : 'number';

                            if (_typeData === 'point') {
                                datas.map(e => {
                                    _data.push(
                                        {
                                            x: parseInt(e['dataX_' + item]),
                                            y: parseInt(e['dataY_' + item])
                                        }
                                    )
                                });
                            } else {
                                _data = datas.map(e => parseInt(e['data_' + item]));
                            }

                            let _backgroundColor = datas[0]['backgroundColor_' + item] ? datas[0]['backgroundColor_' + item] : '';
                            let _fill = datas[0]['fill_' + item] ? (datas[0]['fill_' + item] === 'true') : false;

                            //border , line
                            let _hoverBackgroundColor = datas[0]['hoverBackgroundColor_' + item] ? datas[0]['hoverBackgroundColor_' + item] : '';
                            let _hoverBorderCapStyle = datas[0]['hoverBorderCapStyle_' + item] ? datas[0]['hoverBorderCapStyle_' + item] : '';
                            let _hoverBorderColor = datas[0]['hoverBorderColor_' + item] ? datas[0]['hoverBorderColor_' + item] : '';
                            let _hoverBorderDash = datas[0]['hoverBorderDash_' + item] ? datas[0]['hoverBorderDash_' + item].split(',') : [];
                            let _hoverBorderDashOffset = datas[0]['hoverBorderDashOffset_' + item] ? parseInt(datas[0]['hoverBorderDashOffset_' + item]) : 0;
                            let _hoverBorderJoinStyle = datas[0]['hoverBorderJoinStyle_' + item] ? datas[0]['hoverBorderJoinStyle_' + item] : '';
                            let _hoverBorderWidth = datas[0]['hoverBorderWidth_' + item] ? datas[0]['hoverBorderWidth_' + item] : '';

                            let _borderColor = datas[0]['borderColor_' + item] ? datas[0]['borderColor_' + item] : '';
                            let _borderWidth = datas[0]['borderWidth_' + item] ? datas[0]['borderWidth_' + item] : '';
                            let _borderCapStyle = datas[0]['borderCapStyle_' + item] ? datas[0]['borderCapStyle_' + item] : '';
                            let _borderDash = datas[0]['borderDash_' + item] ? datas[0]['borderDash_' + item].split(',') : [];
                            let _borderDashOffset = datas[0]['borderDashOffset_' + item] ? parseInt(datas[0]['borderDashOffset_' + item]) : 0;

                            let _showLine = datas[0]['showLine_' + item] ? (datas[0]['showLine_' + item] === 'true') : true;

                            let _lineTension = datas[0]['lineTension_' + item] ? parseInt(datas[0]['lineTension_' + item]) : 0.4;
                            let _order = datas[0]['order_' + item] ? parseInt(datas[0]['order_' + item]) : 0;
                            //point
                            let _pointBackgroundColor = datas.map(e => e['pointBackgroundColor_' + item]);
                            let _pointBorderColor = datas.map(e => e['pointBorderColor_' + item]);
                            let _pointBorderWidth = datas.map(e => e['pointBorderWidth_' + item]);
                            let _pointHitRadius = datas.map(e => e['pointHitRadius_' + item]);

                            let _pointHoverBackgroundColor = datas.map(e => e['pointHoverBackgroundColor_' + item]);
                            let _pointHoverBorderColor = datas.map(e => e['pointHoverBorderColor_' + item]);
                            let _pointHoverBorderWidth = datas.map(e => e['pointHoverBorderWidth_' + item]);
                            let _pointHoverRadius = datas.map(e => e['pointHoverRadius_' + item]);
                            let _pointRadius = datas.map(e => e['pointRadius_' + item]);
                            let _pointRotation = datas.map(e => e['pointRotation_' + item]);
                            let _pointStyle = datas.map(e => e['pointStyle_' + item]);


                            let datasetTemp = {
                                label: _label,
                                data: _data,
                                backgroundColor: _backgroundColor,
                                fill: _fill,
                                hoverBackgroundColor: _hoverBackgroundColor,
                                hoverBackgroundColor: _hoverBorderCapStyle,
                                hoverBorderColor: _hoverBorderColor,
                                hoverBorderDash: _hoverBorderDash,
                                hoverBorderDashOffset: _hoverBorderDashOffset,
                                hoverBorderJoinStyle: _hoverBorderJoinStyle,
                                hoverBorderWidth: _hoverBorderWidth,

                                borderColor: _borderColor,
                                borderWidth: _borderWidth,
                                borderCapStyle: _borderCapStyle,
                                borderDash: _borderDash,
                                borderDashOffset: _borderDashOffset,
                                showLine: _showLine,
                                lineTension: _lineTension,
                                order: _order,

                                pointBackgroundColor: _pointBackgroundColor,
                                pointBorderColor: _pointBorderColor,
                                pointBorderWidth: _pointBorderWidth,
                                pointHitRadius: _pointHitRadius,
                                pointHoverBackgroundColor: _pointHoverBackgroundColor,
                                pointHoverBorderColor: _pointHoverBorderColor,
                                pointHoverBorderWidth: _pointHoverBorderWidth,
                                pointHoverRadius: _pointHoverRadius,
                                pointRadius: _pointRadius,
                                pointRotation: _pointRotation,
                                pointStyle: _pointStyle,

                                datalabels: {
                                    labels: {
                                        title: null
                                    },
                                }
                            }

                            datasets.push(datasetTemp)
                        }
                        // console.log(datasets)
                        let defaultOptions = {
                            title: {
                                display: datas[0].options_title_text ? true : false,
                                text: datas[0].options_title_text ? datas[0].options_title_text : null,
                                fontColor: datas[0].options_title_fontColor ? datas[0].options_title_fontColor : "#000000",
                                fontSize: datas[0].options_title_fontSize ? datas[0].options_title_fontSize : 18,
                                position: datas[0].options_title_position ? datas[0].options_title_position : 'top'
                            },
                            legend: {
                                display: true,
                                position: datas[0].options_legend_position ? datas[0].options_legend_position : 'top',
                                fullWidth: true,
                            },
                            responsive: true,

                        };

                        const chart = {
                            type: chartConfig.type,
                            data: {
                                labels: labels,
                                datasets: datasets
                            },
                            options: defaultOptions
                        }
                        // console.log(chart)
                        const newChartInstance = new Chart(chartContainer.current, chart);
                        setChartInstance(newChartInstance);
                    }
                })
                .catch(error => {
                    console.log(error)
                });

        }
    }, [chartContainer]);


    return (
        <canvas ref={chartContainer} style={{ width: '100%' }} />
    )
}

export default GenerateChart;
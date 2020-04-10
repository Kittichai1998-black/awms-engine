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
                            let _data = datas.map(e => parseInt(e['data_' + item]));
                            
                            let _backgroundColor = datas.map(e => e['backgroundColor_' + item]);
                           
                            let _hoverBackgroundColor = datas.map(e => e['hoverBackgroundColor_' + item]);
                            let _hoverBorderColor = datas.map(e => e['hoverBorderColor_' + item]);
                            let _hoverBorderWidth = datas.map(e => e['hoverBorderWidth_' + item]);
                            
                            let _borderColor = datas.map(e => e['borderColor_' + item]);
                            let _borderWidth = datas[0]['borderWidth_' + item] ? datas[0]['borderWidth_' + item] : '';
                            let _borderSkipped = datas[0]['borderSkipped_' + item] ? datas[0]['borderSkipped_' + item] : false;
                            
                            let datasetTemp = {
                                label: _label,
                                data: _data,

                                backgroundColor: _backgroundColor,

                                hoverBackgroundColor: _hoverBackgroundColor,
                                hoverBorderColor: _hoverBorderColor,
                                hoverBorderWidth: _hoverBorderWidth,
                                
                                borderColor: _borderColor,
                                borderWidth: _borderWidth,
                                borderSkipped: _borderSkipped,

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
                            responsive: true,
                            legend: {
                                display: true,
                                position: datas[0].options_legend_position ? datas[0].options_legend_position : 'top',
                                fullWidth: true,
                            },
                            scales: {
                                xAxes: [{
                                    offset: true,
                                    scaleLabel: {
                                        display: datas[0].scales_xAxes_labelString ? true : false,
                                        labelString: datas[0].scales_xAxes_labelString ? datas[0].scales_xAxes_labelString : '',
                                    },
                                }],
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    },
                                    scaleLabel: {
                                        display: datas[0].scales_yAxes_labelString ? true : false,
                                        labelString: datas[0].scales_yAxes_labelString ? datas[0].scales_yAxes_labelString : ''
                                    }
                                }]
                            },

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
        <div>
            <canvas ref={chartContainer} style={{ width: '100%' }} />
        </div>

    )
}

export default GenerateChart;
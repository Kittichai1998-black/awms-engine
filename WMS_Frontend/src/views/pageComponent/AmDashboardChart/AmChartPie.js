import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
import datalabels from 'chartjs-plugin-datalabels';
import { apicall } from '../../../components/function/CoreFunction'
const Axios = new apicall();

// Chart.helpers.merge(Chart.defaults.global, {
//     maintainAspectRatio: false,
//     tooltips: true,
//     layout: {
//         padding: 36
//     },
//     elements: {
//         line: {
//             fill: false
//         },
//         point: {
//             hoverRadius: 7,
//             radius: 5
//         }
//     },
//     plugins: {
//         legend: true,
//         title: true,
//     }
// });
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

                            let _borderAlign = datas[0]['borderAlign_' + item] ? datas[0]['borderAlign_' + item] : 'center';
                            let _borderColor = datas.map(e => e['borderColor_' + item]);
                            let _borderWidth = datas[0]['borderWidth_' + item] ? datas[0]['borderWidth_' + item] : '';

                            let _hoverBackgroundColor = datas.map(e => e['hoverBackgroundColor_' + item]);
                            let _hoverBorderColor = datas.map(e => e['hoverBorderColor_' + item]);
                            let _hoverBorderWidth = datas.map(e => e['hoverBorderWidth_' + item]);

                            let _weight = datas[0]['weight_' + item] ? parseInt(datas[0]['weight_' + item]) : 1;
                            let datasetTemp = {
                                label: _label,
                                data: _data,

                                backgroundColor: _backgroundColor,

                                borderAlign: _borderAlign,
                                borderColor: _borderColor,
                                borderWidth: _borderWidth,

                                hoverBackgroundColor: _hoverBackgroundColor,
                                hoverBorderColor: _hoverBorderColor,
                                hoverBorderWidth: _hoverBorderWidth,
                                weight: _weight,

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
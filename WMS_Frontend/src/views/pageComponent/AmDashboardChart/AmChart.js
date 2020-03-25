import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
import datalabels from 'chartjs-plugin-datalabels';


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
        // customPlugins = null
    } = props;

    const chartContainer = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);

    useEffect(() => {
        if (chartContainer && chartContainer.current) {
            const newChartInstance = new Chart(chartContainer.current, chartConfig);
            setChartInstance(newChartInstance);
        }
    }, [chartContainer]);


    return (
        <div>
            <canvas ref={chartContainer} style={{ width: '100%' }} />
        </div>

    )
}

export default GenerateChart;
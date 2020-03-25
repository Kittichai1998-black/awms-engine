import React, { useEffect, useRef, useState } from "react";
import Chartjs from "chart.js";

const randomInt = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

const chartConfig = {
    type: "bar",
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
            {
                label: "# of Votes",
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor:
                    "rgba(255, 99, 132, 0.2)",
                borderColor:
                    "rgba(255, 99, 132, 1)",
                borderWidth: 4
            },
            {
                label: 'level of xxxx',
                data: [26, 30, 8, 65, 59, 44],
                backgroundColor: '#71B37C',
                borderWidth: 4
            }
        ]
    },
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true
                    }
                }
            ]
        }
    }
};

const Chart = () => {
    const chartContainer = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);

    useEffect(() => {
        if (chartContainer && chartContainer.current) {
            const newChartInstance = new Chartjs(chartContainer.current, chartConfig);
            setChartInstance(newChartInstance);
        }
    }, [chartContainer]);

    const updateDataset = (datasetIndex, newData) => {
        chartInstance.data.datasets[datasetIndex].data = newData;
        chartInstance.update();
    };

    const onButtonClick = () => {
        const data = [
            randomInt(),
            randomInt(),
            randomInt(),
            randomInt(),
            randomInt(),
            randomInt()
        ];
        updateDataset(0, data);
    };

    return (
        <div>
            <button onClick={onButtonClick}>Randomize!</button>
            <canvas ref={chartContainer} />
        </div>
    );
};

export default Chart;

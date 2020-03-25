import React, { Component, useState, useEffect } from "react";
import { Bar } from 'react-chartjs-2';
// import merge from 'lodash.merge';
// or
// import { merge } from 'lodash';

// merge(Line, {
//   global: {
//     animation: false,
//     line: {
//       borderColor: '#F85F73',
//      },
//   },
// });
const DashboardBar = props => {

    const [chartData, setChartData] = useState({});

    const chart = () => {
        setChartData({
            labels: ['mon', 'tue', 'wed', 'thu', 'fri'],
            datasets: [
                {
                    label: 'level of thiccness',
                    data: [32, 45, 12, 75, 69],
                    backgroundColor: '#EC932F',
                    borderWidth: 4
                },
                {
                    label: 'level of xxxx',
                    data: [26, 30, 8, 65, 59],
                    backgroundColor: '#71B37C',
                    borderWidth: 4
                }
            ]
        },)
    };
    useEffect(() => {
        chart()
    }, [])
    return (
        <div>
            {/* style={{ height: '700px', width: '700px' }} */}
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    title: {
                        text: 'THICCNESS SCALE',
                        display: true
                    },
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    autoSkip: true,
                                    maxTicksLimit: 10,
                                    beginAtZero:true
                                },
                                // gridLines:{
                                //     display: false
                                // }
                            }
                        ]
                    }
                }}
            />
        </div>

    );
};

export default DashboardBar;

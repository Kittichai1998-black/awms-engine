import React, { useEffect, useRef, useState } from "react";
import AmDashboardChart from '../../pageComponent/AmDashboardChart/AmDashboardChart';
/*
const chartConfigs = [
  [
    {
      type: "pie",
      // title: "ex.pie",
      chart: {
        type: "pie",
        data: {
          labels: ["Red", "Yellow", "Green", "Blue", "Purple"],
          datasets: [{
            // color: "#C9DE00",
            backgroundColor: [
              '#B21F00',
              '#C9DE00',
              '#2FDE00',
              '#00A6B4',
              '#6800B4'
            ],
            hoverBackgroundColor: [
              '#501800',
              '#4B5000',
              '#175000',
              '#003350',
              '#35014F'
            ],
            data: [12, 19, 3, 5, 2],
            datalabels: {
              labels: {
                title: null
              }
            }
          }]
        },
        options: {
          title: {
            display: true,
            text: 'ex.pie1',
            fontColor: "#B21F00",
            fontSize: 18,
            position: 'left'
          },
          legend: {
            display: true,
            position: 'right',
            fullWidth: true,
          },
          responsive: true,
          plugins: {
            datalabels: {
              backgroundColor: function (context) {
                return context.dataset.backgroundColor;
              },
              borderColor: 'white',
              borderRadius: 25,
              borderWidth: 2,
              color: 'white',
              formatter: Math.round
            }
          },

        }
      }
    },
    {
      type: "bar",
      // title: "ex.bar",
      chart: {
        type: "bar",
        data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
            label: "#color",
            color: "#5A141E",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            data: [12, 19, 3, 5, 2, 3],
            // datalabels: {
            //   font: {
            //     weight: 'bold'
            //   },
            // }
          }, {
            label: "#color2",
            color: "#ffffff",
            backgroundColor: "#00A6B4",
            borderColor: "#00A6B4",
            data: [15, 39, 17, 3, 8, 23],
            datalabels: {
              font: {
                weight: 'bold',
                color: "#ffffff",
              },
            }
          }]
        },
        options: {
          title: {
            display: true,
            text: 'ex.bar1',
            fontColor: "#B21F00",
            fontSize: 18,
            position: 'left'
          },
          scales: {
            xAxes: [{
              display: true,
              offset: true,
              scaleLabel: {
                display: true,
                labelString: 'xxx1'
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true
              },
              scaleLabel: {
                display: true,
                labelString: 'xxx2'
              }
            }]
          },
          plugins: {
            datalabels: {
              color: 'white',
              display: function (context) {
                return context.dataset.data[context.dataIndex] > 15;
              },
              font: {
                weight: 'bold'
              },
              formatter: Math.round
            }
          },
        }
      }
    }
  ],
  [
    {
      type: "pie",
      title: "ex.pie2",
      chart: {
        type: "pie",
        data: {
          labels: ["Red", "Yellow", "Green", "Blue", "Purple"],
          datasets: [{
            // color: "#C9DE00",
            backgroundColor: [
              '#B21F00',
              '#C9DE00',
              '#2FDE00',
              '#00A6B4',
              '#6800B4'
            ],
            hoverBackgroundColor: [
              '#501800',
              '#4B5000',
              '#175000',
              '#003350',
              '#35014F'
            ],
            data: [12, 19, 3, 5, 2],
            datalabels: {
              font: {
                weight: 'bold'
              },
            }
          }]
        },
        options: {
          legend: {
            display: true,
            position: 'top',
            fullWidth: true,
            reverse: false,
            labels: {
              fontColor: 'rgb(255, 99, 132)'
            }
          },
          tooltips: {
            callbacks: {
              labelColor: function (tooltipItem, chart) {
                return {
                  borderColor: 'rgb(255, 0, 0)',
                  backgroundColor: 'rgb(255, 0, 0)'
                };
              },
              labelTextColor: function (tooltipItem, chart) {
                return '#543453';
              }
            }
          },
          responsive: true,
          plugins: {
            datalabels: {
              backgroundColor: function (context) {
                return context.dataset.backgroundColor;
              },
              borderColor: 'white',
              borderRadius: 25,
              borderWidth: 2,
              color: 'white',
              formatter: Math.round
            }
          },

        }
      }
    },
    {
      type: "bar",
      title: "ex.bar",
      chart: {
        type: "bar",
        data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
            label: "#color",
            color: "#5A141E",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            data: [12, 19, 3, 5, 2, 3],
            datalabels: {
              labels: {
                title: null
              }
            }
          }]
        },
        options: {
          scales: {
            xAxes: [{
              display: true,
              offset: true
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      }
    },

  ],
  [
    {
      type: 'line',
      title: "ex.line",
      chart: {
        type: "line",
        data: {
          labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
          datasets: [{

            label: 'apples',
            data: [12, 19, 3, 17, 6, 3, 7],
            borderColor: "rgb(255, 99, 132)",
            fill: false,
            datalabels: {
              labels: {
                title: null
              }
            }
          }, {
            label: 'oranges',
            data: [2, 29, 5, 5, 2, 3, 10],
            borderColor: "rgb(255, 199, 132)",
            hoverBackgroundColor: 'black',
            fill: false,
            // datalabels: {
            //   labels: {
            //     title: null
            //   }
            // }
          },
          ]
        },
        // "data": {
        //   "labels": ["January", "February", "March", "April", "May", "June", "July"],
        //   "datasets": [{
        //     "label": "My First Dataset",
        //     "data": [65, 59, 80, 81, 56, 55, 40],
        //     "fill": true,
        //     "borderColor": "rgb(75, 192, 192)",
        //     "lineTension": 0.1,
        //     pointStyle: 'circle',
        //     pointBackgroundColor: 'rgba(0, 0, 0, 0.1)'
        //   }]
        // },
        options: {
          responsive: true,
          // plugins: {
          //   datalabels: {
          //     backgroundColor: 'rgba(255, 99, 132, 0.2)',
          //     borderColor: 'white',
          //     borderRadius: 25,
          //     borderWidth: 2,
          //     color: 'white',
          //     formatter: Math.round
          //   }
          // },
        }
      }
    }
  ]
];

*/

const ChartJS = () => {

  const chartConfigs = [
    [
      {
        type: 'bar',
        title: "สถิติการรับเข้า-เบิกออก รายชั่วโมง",
        spname: 'DASHBOARD_CHART_RECEIVEISSUE_HOUR',
      },
      {
        type: 'bar',
        title: "สถิติการรับเข้า-เบิกออก รายวัน",
        spname: 'DASHBOARD_CHART_RECEIVEISSUE_DAY',
      },
    ],
    [
      {
        type: 'pie',
        title: "สถิติการรับเข้าสินค้า",
        spname: 'DASHBOARD_CHART_PIE_RECEIVE',
      },
      {
        type: 'pie',
        title: "สถิติการเบิกออกสินค้า",
        spname: 'DASHBOARD_CHART_PIE_ISSUE',
      },
    ],
    [
      {
        type: 'bar',
        title: "สถิติปริมาณงาน รายชั่วโมง",
        spname: 'DASHBOARD_CHART_THROUGHPUT_HOUR',
      },
      {
        type: 'bar',
        title: "สถิติปริมาณงาน รายวัน",
        spname: 'DASHBOARD_CHART_THROUGHPUT_DAY',
      }
    ]
  ];

  return (
      <AmDashboardChart
        chartConfigs={chartConfigs}
        showTime={true}
      />
  );
};

export default ChartJS;

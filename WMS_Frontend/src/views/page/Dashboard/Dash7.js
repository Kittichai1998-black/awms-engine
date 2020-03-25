import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
// import datalabels from 'chartjs-plugin-datalabels';

// Chart.helpers.merge(Chart.defaults.global, {
//   maintainAspectRatio: false,
//   tooltips: false,
//   layout: {
//     padding: 36
//   },
//   elements: {
//     line: {
//       fill: false
//     },
//     point: {
//       hoverRadius: 7,
//       radius: 5
//     }
//   },
//   plugins: {
//     legend: true,
//     title: true
//   }
// });

const randomInt = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

const chartConfig = {
  type: "line",
  data: {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [{

      label: 'apples',
      data: [12, 19, 3, 17, 6, 3, 7],
      borderColor: "rgb(255, 99, 132)",
      fill: false,
      // datalabels: {
      //   font: {
      //     weight: 'bold'
      //   },
      // }
    }, {
      label: 'oranges',
      data: [2, 29, 5, 5, 2, 3, 10],
      borderColor: "rgb(255, 199, 132)",
      hoverBackgroundColor:'black',
      fill: false
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
};

const ChartJS = () => {
  const chartContainer = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      const newChartInstance = new Chart(chartContainer.current, chartConfig);
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
      {/* <button onClick={onButtonClick}>Randomize!</button> */}
      <canvas ref={chartContainer} style={{ height: '700px', width: '700px' }}/>
    </div>
  );
};

export default ChartJS;

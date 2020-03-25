import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
import datalabels from 'chartjs-plugin-datalabels';

Chart.helpers.merge(Chart.defaults.global, {
  aspectRatio: 4 / 3,
  tooltips: false,
  layout: {
    padding: {
      top: 32
    }
  },
  elements: {
    line: {
      fill: false
    }
  },
  plugins: {
    legend: false,
    title: false
  }
});

const randomInt = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

const chartConfig = {
  type: "bar",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [{
      color: "#5A141E",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      data: [12, 19, 3, 5, 2, 3],
      datalabels: {
        font: {
          weight: 'bold'
        },
      }
    }]
  },
  options: {
    plugins: {
      datalabels: {
        align: 'end',
        anchor: 'end',
        font: {
          weight: 'bold'
        },
        color: function (context) {
          return context.dataset.color;
        },
        font: function (context) {
          var w = context.chart.width;
          return {
            size: w < 512 ? 12 : 14
          };
        },
        formatter: function (value, context) {
          return context.chart.data.labels[context.dataset];
        }
      }
    },
    scales: {
      xAxes: [{
        display: false,
        offset: true
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
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
      <button onClick={onButtonClick}>Randomize!</button>
      <canvas ref={chartContainer} />
    </div>
  );
};

export default ChartJS;

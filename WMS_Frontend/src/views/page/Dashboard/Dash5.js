import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
import datalabels from 'chartjs-plugin-datalabels';

Chart.helpers.merge(Chart.defaults.global, {
  maintainAspectRatio: false,
  tooltips: false,
  layout: {
    padding: 36
  },
  elements: {
    line: {
      fill: false
    },
    point: {
      hoverRadius: 7,
      radius: 5
    }
  },
  plugins: {
    legend: true,
    title: true
  }
});

const randomInt = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

const chartConfig = {
  type: "pie",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple"],
    datasets: [{
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
    console.log(datasetIndex)
    console.log(newData)
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
      <canvas ref={chartContainer} style={{ height: '700px', width: '700px' }}/>
    </div>
  );
};

export default ChartJS;

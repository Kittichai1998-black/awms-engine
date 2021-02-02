import React, { useEffect, useRef, useState } from "react";
import AmDashboardChart from '../../pageComponent/AmDashboardChart/AmDashboardChart';
 
const ChartJS = (props) => {
  const chartConfigs = [
    [
      {
        type: 'bar',
        title: "The Statistics of Receiving & Issue by Hourly",
        spname: 'DASHBOARD_CHART_RECEIVEISSUE_HOUR',
      },
      {
        type: 'bar',
        title: "The Statistics of Receiving & Issue by Daily",
        spname: 'DASHBOARD_CHART_RECEIVEISSUE_DAY',
      },
    ],
    [
      {
        type: 'pie',
        title: "The Statistics of Receiving",
        spname: 'DASHBOARD_CHART_PIE_RECEIVE',
      },
      {
        type: 'pie',
        title: "The Statistics of Issue",
        spname: 'DASHBOARD_CHART_PIE_ISSUE',
      },
    ],
    [
      {
        type: 'bar',
        title: "The Statistics of Throughtpu by Hourly",
        spname: 'DASHBOARD_CHART_THROUGHPUT_HOUR',
      },
      {
        type: 'bar',
        title: "The Statistics of Throughtpu by Daily",
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

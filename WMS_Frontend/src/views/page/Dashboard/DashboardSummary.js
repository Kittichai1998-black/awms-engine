import React, { useEffect, useRef, useState } from "react";
import AmDashboardChart from '../../pageComponent/AmDashboardChart/AmDashboardChart';
 
const ChartJS = (props) => {
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

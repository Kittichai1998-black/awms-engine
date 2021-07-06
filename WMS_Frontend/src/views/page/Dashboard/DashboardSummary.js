import React, { useEffect, useRef, useState } from "react";
import AmDashboardChart from '../../pageComponent/AmDashboardChart/AmDashboardChart';
import { useTranslation } from 'react-i18next'


const ChartJS = (props) => {
  const { t } = useTranslation();
  const chartConfigs = [
    
    // [
    //   {
    //     type: 'pie',
    //     title: "The Statistics of Receiving",
    //     spname: 'DASHBOARD_CHART_PIE_RECEIVE',
    //   },
    //   {
    //     type: 'pie',
    //     title: "The Statistics of Issue",
    //     spname: 'DASHBOARD_CHART_PIE_ISSUE',
    //   },
    // ],
    [ 
      {
        type: 'bar',
        title: t("The Statistics of Throughput by Hourly"),
        spname: 'DASHBOARD_CHART_THROUGHPUT_HOUR',
      },
      {
        type: 'bar',
        title: t("The Statistics of Throughput by Daily"),
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

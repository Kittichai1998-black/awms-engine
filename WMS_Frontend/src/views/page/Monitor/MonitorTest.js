import * as signalR from "@aspnet/signalr";

// import Axios from 'axios'
import queryString from "query-string";
// import Moment from 'moment'
import React, { useState, useEffect } from "react";
// import { useTranslation } from 'react-i18next'

// import AmPageDashboard from '../../../components/AmPageDashboard';
// import { createQueryString } from '../../../components/function/CoreFunction'
// import { useTranslation } from 'react-i18next'
import MonitorCard from "../../pageComponent/MonitorCard";
// import MonitorCard from '../../views/pageComponent/MonitorCard';
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";

const Setpalet = (props) => {
  const [count, setCount] = useState(0);
  const gridConfigs = [
    [
      {
        code: "G01",
        name: "พาเลท1",
      },
      {
        code: "G02",
        name: "พาเลท2",
      },
      {
        code: "G03",
        name: "พาเลท3",
      },
      {
        code: "G04",
        name: "พาเลท4",
      },
      {
        code: "G05",
        name: "พาเลท5",
      },
    ],
    [
      {
        code: "G06",
        name: "พาเลท6",
      },
      {
        code: "G07",
        name: "พาเลท8",
      },
      {
        code: "G08",
        name: "พาเลท8",
      },
      {
        code: "G09",
        name: "พาเลท9",
      },
      {
        code: "G010",
        name: "พาเลท10",
      },
    ],
  ];
  return (
    <>
      <MonitorCard gridConfigs={gridConfigs} />
    </>
  );
};
export default Setpalet;

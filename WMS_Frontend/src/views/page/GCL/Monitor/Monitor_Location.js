import * as signalR from "@aspnet/signalr";

// import Axios from 'axios'
import queryString from "query-string";
// import Moment from 'moment'
import React, { useState, useEffect } from "react";
// import { useTranslation } from 'react-i18next'

// import AmPageDashboard from '../../../components/AmPageDashboard';
// import { createQueryString } from '../../../components/function/CoreFunction'
// import { useTranslation } from 'react-i18next'
import MonitorCard from "../../../pageComponent/MonitorCard";
// import MonitorCard from '../../views/pageComponent/MonitorCard';
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";

const SetMonitorLocation = (props) => {
  return (
    <>
      <MonitorCard/>
    </>
  );
};
export default SetMonitorLocation;

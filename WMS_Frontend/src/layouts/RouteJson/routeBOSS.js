import Loadable from "react-loadable";
import React from "react";

function Loading() {
    return <div>Loading...</div>;
}

const PK_ManageQueue = Loadable({
    loader: () => import("../../views/page/BOSS/PK/PK_ManageQueue"),
    loading: Loading
});
const PK_GetDetail = Loadable({
    loader: () => import("../../views/page/BOSS/PK/PK_GetDetail"),
    loading: Loading
});

const AD_Create = Loadable({
    loader: () => import("../../views/page/ENGINE/AD/AD_Create"),
    loading: Loading
});
const AD_Detail = Loadable({
    loader: () => import("../../views/page/ENGINE/AD/AD_Detail"),
    loading: Loading
});
const AD_Search = Loadable({
    loader: () => import("../../views/page/ENGINE/AD/AD_Search"),
    loading: Loading
});

const AD_ManageQueue = Loadable({
    loader: () => import("../../views/page/BOSS/AD/AD_ManageQueue"),
    loading: Loading
});
const AD_Checker = Loadable({
    loader: () => import("../../views/page/BOSS/AD/AD_Checker"),
    loading: Loading
});

const PI_Create = Loadable({
    loader: () => import("../../views/page/ENGINE/PI/PI_Create"),
    loading: Loading
});
const PI_Detail = Loadable({
    loader: () => import("../../views/page/ENGINE/PI/PI_Detail"),
    loading: Loading
});
const PI_Search = Loadable({
    loader: () => import("../../views/page/ENGINE/PI/PI_Search"),
    loading: Loading
});
const PI_Checker = Loadable({
    loader: () => import("../../views/page/BOSS/PI/PI_Checker"),
    loading: Loading
});

const PI_ManageQueue = Loadable({
    loader: () => import("../../views/page/BOSS/PI/PI_ManageQueue"),
    loading: Loading
});
const MonitorWorking_PD = Loadable({
    loader: () => import("../../views/page/BOSS/Monitor/MonitorWorkingPD"),
    loading: Loading
});
const MonitorWorking_LD = Loadable({
    loader: () => import("../../views/page/BOSS/Monitor/MonitorWorkingLD"),
    loading: Loading
});
const MonitorWorking_CT = Loadable({
    loader: () => import("../../views/page/BOSS/Monitor/MonitorWorkingCT"),
    loading: Loading
});

const QualityStatusFG = Loadable({
    loader: () => import("../../views/page/Warehouse/QualityStatusFG"),
    loading: Loading
});
const routes = [
    { path: "/counting/create", name: "PI Create", compoment: PI_Create, exact: true },
    { path: "/counting/detail", name: "PI View", compoment: PI_Detail, exact: true },
    { path: "/counting/search", name: "PI View", compoment: PI_Search, exact: true },
    { path: "/counting/managequeue", name: "PI Manage Queue", compoment: PI_ManageQueue, exact: true },
    { path: "/counting/coutingchecker", name: "PI Checker", compoment: PI_Checker, exact: true },

    { path: "/audit/create", name: "AD Create", compoment: AD_Create, exact: true },
    { path: "/audit/detail", name: "AD View", compoment: AD_Detail, exact: true },
    { path: "/audit/search", name: "AD View", compoment: AD_Search, exact: true },
    { path: "/audit/managequeue", name: "GI Manage Queue", compoment: AD_ManageQueue, exact: true },
    { path: "/audit/auditchecker", name: "AD Checker", compoment: AD_Checker, exact: true },

    { path: "/issue/managequeue", name: "PK Manage Queue", compoment: PK_ManageQueue, exact: true },
    { path: "/issue/pickedinfo", name: "PK Get Detail", compoment: PK_GetDetail, exact: true },

    { path: "/monitor/workingPD", name: "Monitor Working Zone Production", compoment: MonitorWorking_PD, exact: true },
    { path: "/monitor/workingLD", name: "Monitor Working Zone Loading", compoment: MonitorWorking_LD, exact: true },
    { path: "/monitor/workingCT", name: "Monitor Counting", compoment: MonitorWorking_CT, exact: true },

    { path: "/warehouse/qualitystatusFG", name: "Quality Status", compoment: QualityStatusFG, exact: true },
]

export default routes;
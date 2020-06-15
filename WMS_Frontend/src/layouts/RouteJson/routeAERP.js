import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}
const GR_Create = Loadable({
  loader: () => import("../../views/page/AERP/GR/GR_Create"),
  loading: Loading
});
const GR_Detail = Loadable({
  loader: () => import("../../views/page/AERP/GR/GR_Detail"),
  loading: Loading
});
const GR_Search = Loadable({
  loader: () => import("../../views/page/AERP/GR/GR_Search"),
  loading: Loading
});
const GI_Create = Loadable({
  loader: () => import("../../views/page/AERP/GI/GI_Create"),
  loading: Loading
});
const GI_Detail = Loadable({
  loader: () => import("../../views/page/AERP/GI/GI_Detail"),
  loading: Loading
});
const GI_Search = Loadable({
  loader: () => import("../../views/page/AERP/GI/GI_Search"),
  loading: Loading
});
const GI_WorkQueue = Loadable({
  loader: () => import("../../views/page/AERP/GI/GI_WorkQueue"),
  loading: Loading
});
// const MonitorPicking = Loadable({
//   loader: () => import("../../views/page/AERP/Monitor/MonitorPicking"),
//   loading: Loading
// });
const AD_Create = Loadable({
  loader: () => import("../../views/page/AERP/AD/AD_Create"),
  loading: Loading
});
const AD_Detail = Loadable({
  loader: () => import("../../views/page/AERP/AD/AD_Detail"),
  loading: Loading
});
const AD_Search = Loadable({
  loader: () => import("../../views/page/AERP/AD/AD_Search"),
  loading: Loading

});
const CountingAdj = Loadable({
  loader: () => import("../../views/page/MRK/Counting/CountingAdj"),
  loading: Loading
});
const MappingPallet = Loadable({
  loader: () => import("../../views/page/AERP/GR/MappingPallet"),
  loading: Loading
});
const MoveLocation = Loadable({
  loader: () => import("../../views/page/ENGINE/MoveLocation"),
  loading: Loading
});
const routes = [
  //{ path: "/monitor/picking", name: "Monitor Picking", compoment: MonitorPicking, exact: true },

  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  { path: "/receive/detail", name: "GR View", compoment: GR_Detail, exact: true },
  { path: "/receive/search", name: "GR View", compoment: GR_Search, exact: true },
  { path: "/receive/receivefg", name: "GR View", compoment: MappingPallet, exact: true },

  { path: "/issue/create", name: "GI Create", compoment: GI_Create, exact: true },
  { path: "/issue/detail", name: "GI View", compoment: GI_Detail, exact: true },
  { path: "/issue/search", name: "GI View", compoment: GI_Search, exact: true },
  { path: "/issue/managequeue", name: "GI Manage Queue", compoment: GI_WorkQueue, exact: true },

  { path: "/audit/create", name: "AD Create", compoment: AD_Create, exact: true },
  { path: "/audit/detail", name: "AD View", compoment: AD_Detail, exact: true },
  { path: "/audit/search", name: "AD View", compoment: AD_Search, exact: true },
  //{ path: "/counting/managequeue", name: "base5", compoment: ProcessQueueCT, exact: true },
  { path: "/counting/manualcounting", name: "base5", compoment: CountingAdj, exact: true },

  { path: "/sto/move", name: "Move Location", compoment: MoveLocation, exact: true },
];

export default routes;

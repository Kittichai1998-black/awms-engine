import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const Monitor_Location = Loadable({
  loader: () => import("../../views/page/GCL/Monitor/Monitor_Location"),
  loading: Loading
});
const GR_Create = Loadable({
  loader: () => import("../../views/page/GCL/Recive/GR_Create"),
  loading: Loading
});
const GR_Search = Loadable({
  loader: () => import("../../views/page/GCL/Recive/GR_Search"),
  loading: Loading
});

const PA_Create = Loadable({
  loader: () => import("../../views/page/GCL/Recive/PA_Create"),
  loading: Loading
});
const PA_Search = Loadable({
  loader: () => import("../../views/page/GCL/Recive/PA_Search"),
  loading: Loading
});

const GI_Create = Loadable({
  loader: () => import("../../views/page/GCL/Issue/GI_Create"),
  loading: Loading
});
const GI_Search = Loadable({
  loader: () => import("../../views/page/GCL/Issue/GI_Search"),
  loading: Loading
});
const PK_Create = Loadable({
  loader: () => import("../../views/page/GCL/Issue/PK_Create"),
  loading: Loading
});
const PK_Search = Loadable({
  loader: () => import("../../views/page/GCL/Issue/PK_Search"),
  loading: Loading
});
const routes = [

  { path: "/monitor/location", name: "Monitor Location", compoment: Monitor_Location, exact: true, child: true },
  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  { path: "/receive/search", name: "GR Search", compoment: GR_Search, exact: true },

  { path: "/receive/putawaycreate", name: "PA Create", compoment: PA_Create, exact: true },
  { path: "/receive/putawaysearch", name: "PA Search", compoment: PA_Search, exact: true },

  { path: "/issue/create", name: "GI Create", compoment: GI_Create, exact: true },
  { path: "/issue/search", name: "GI View", compoment: GI_Search, exact: true },

  { path: "/issue/pickingcreate", name: "PK Create", compoment: PK_Create, exact: true },
  { path: "/issue/pickingsearch", name: "PK Search", compoment: PK_Search, exact: true },
];

export default routes;

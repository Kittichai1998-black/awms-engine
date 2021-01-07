import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}


const GR_Create = Loadable({
  loader: () => import("../../views/page/ENGINE/GR/GR_Create_FGcus"),
  loading: Loading
});
const GR_Detail = Loadable({
  loader: () => import("../../views/page/ENGINE/GR/GR_Detail"),
  loading: Loading
});
const GR_Search = Loadable({
  loader: () => import("../../views/page/ENGINE/GR/GR_Search"),
  loading: Loading
});

const PA_Create = Loadable({
  loader: () => import("../../views/page/ENGINE/PA/PA_Create"),
  loading: Loading
});
const PA_Detail = Loadable({
  loader: () => import("../../views/page/ENGINE/PA/PA_Detail"),
  loading: Loading
});
const PA_Search = Loadable({
  loader: () => import("../../views/page/ENGINE/PA/PA_Search"),
  loading: Loading
});

const PK_Create = Loadable({
  loader: () => import("../../views/page/ENGINE/PK/PK_Create"),
  loading: Loading
});
const PK_Detail = Loadable({
  loader: () => import("../../views/page/ENGINE/PK/PK_Detail"),
  loading: Loading
});
const PK_Search = Loadable({
  loader: () => import("../../views/page/ENGINE/PK/PK_Search"),
  loading: Loading
});

const GI_Create = Loadable({
  loader: () => import("../../views/page/ENGINE/GI/GI_Create_FGcus"),
  loading: Loading
});
const GI_Detail = Loadable({
  loader: () => import("../../views/page/ENGINE/GI/GI_Detail"),
  loading: Loading
});
const GI_Search = Loadable({
  loader: () => import("../../views/page/ENGINE/GI/GI_Search"),
  loading: Loading
});



const GI_WorkQueue = Loadable({
  loader: () => import("../../views/page/ENGINE/GI/GI_WorkQueue"),
  loading: Loading
});
const MonitorPicking = Loadable({
  loader: () => import("../../views/page/ENGINE/Monitor/MonitorPicking"),
  loading: Loading
});
const SO_Create = Loadable({
  loader: () => import("../../views/page/ENGINE/SO/SO_Create"),
  loading: Loading
});
const SO_Detail = Loadable({
  loader: () => import("../../views/page/ENGINE/SO/SO_Detail"),
  loading: Loading
});
const SO_Search = Loadable({
  loader: () => import("../../views/page/ENGINE/SO/SO_Search"),
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
const DoneWorkQueue = Loadable({
  loader: () => import("../../views/page/ENGINE/WorkQueue/DoneWorkQueue"),
  loading: Loading
});

const MoveLocation = Loadable({
  loader: () => import("../../views/page/ENGINE/MoveLocation"),
  loading: Loading
});
const GR_PalletByHH = Loadable({
  loader: () => import("../../views/page/ENGINE/GR/GR_PalletByHH"),
  loading: Loading
});
const GR_PalletEmpByHH = Loadable({
  loader: () => import("../../views/page/ENGINE/GR/GR_PalletEmpByHH"),
  loading: Loading
});


const routes = [
  { path: "/sto/move", name: "Move Location", compoment: MoveLocation, exact: true },
  { path: "/workqueue/done", name: "Done WorkQueue", compoment: DoneWorkQueue, exact: true },

  { path: "/monitor/picking", name: "Monitor Picking", compoment: MonitorPicking, exact: true },

  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  { path: "/receive/detail", name: "GR View", compoment: GR_Detail, exact: true, child: true },
  { path: "/receive/search", name: "GR Search", compoment: GR_Search, exact: true },
  { path: "/receive/hh", name: "GR HH", compoment: GR_PalletByHH, exact: true },
  { path: "/receive/emp", name: "GR EMP", compoment: GR_PalletEmpByHH, exact: true },

  { path: "/receive/putawaycreate", name: "PA Create", compoment: PA_Create, exact: true },
  { path: "/receive/putawaydetail", name: "PA View", compoment: PA_Detail, exact: true, child: true },
  { path: "/receive/putawaysearch", name: "PA Search", compoment: PA_Search, exact: true },

  { path: "/issue/pickingcreate", name: "PK Create", compoment: PK_Create, exact: true },
  { path: "/issue/pickingdetail", name: "PK View", compoment: PK_Detail, exact: true, child: true },
  { path: "/issue/pickingsearch", name: "PK Search", compoment: PK_Search, exact: true },

  { path: "/issue/create", name: "GI Create", compoment: GI_Create, exact: true },
  { path: "/issue/detail", name: "GI View", compoment: GI_Detail, exact: true, child: true },
  { path: "/issue/search", name: "GI View", compoment: GI_Search, exact: true },
  { path: "/issue/managequeue", name: "GI Manage Queue", compoment: GI_WorkQueue, exact: true },

  { path: "/shipment/create", name: "SO Create", compoment: SO_Create, exact: true },
  { path: "/shipment/detail", name: "SO View", compoment: SO_Detail, exact: true, child: true },
  { path: "/shipment/search", name: "SO Search", compoment: SO_Search, exact: true },

  { path: "/counting/create", name: "PI Create", compoment: PI_Create, exact: true },
  { path: "/counting/detail", name: "PI View", compoment: PI_Detail, exact: true, child: true },
  { path: "/counting/search", name: "PI Search", compoment: PI_Search, exact: true },

  { path: "/audit/create", name: "AD Create", compoment: AD_Create, exact: true },
  { path: "/audit/detail", name: "AD View", compoment: AD_Detail, exact: true, child: true },
  { path: "/audit/search", name: "AD Search", compoment: AD_Search, exact: true },

];

export default routes;

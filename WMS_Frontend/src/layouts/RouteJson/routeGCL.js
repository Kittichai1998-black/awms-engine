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

const GR_PalletByHH = Loadable({
  loader: () => import("../../views/page/GCL/Receive/MappingReceive_HH"),
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

const CreateGIByQR = Loadable({
  loader: () => import("../../views/page/GCL/Issue/CreateGIByQR"),
  loading: Loading
});
const CreateGRByQR = Loadable({
  loader: () => import("../../views/page/GCL/Receive/CreateGRByQR"),
  loading: Loading
});

const RegistShuttle = Loadable({
  loader: () => import("../../views/page/GCL/Receive/RegistShuttle"),
  loading: Loading
});
const GI_WorkQueue = Loadable({
  loader: () => import("../../views/page/GCL/Issue/PK_ManageQueue"),
  loading: Loading
});

// const GR_Detail = Loadable({
//   loader: () => import("../../views/page/GCL/Recive/GR_Detail"),
//   loading: Loading
// });

const MonitorReceive = Loadable({
  loader: () => import("../../views/page/GCL/Receive/MonitorReceive"),
  loading: Loading
});

const ScanReceiveGateMapping = Loadable({
  loader: () => import("../../views/page/GCL/Receive/ScanReceiveGateMapping"),
  loading: Loading
});

const PickingMonitor = Loadable({
  loader: () => import("../../views/page/GCL/Issue/PickingMonitor"),
  loading: Loading
});

const ScanShuttleCheckIn = Loadable({
  loader: () => import("../../views/page/GCL/Warehouse/ScanShuttleCheckIn"),
  loading: Loading
});

const ScanShuttleCheckOut = Loadable({
  loader: () => import("../../views/page/GCL/Warehouse/ScanShuttleCheckOut"),
  loading: Loading
});

const DockOutboundDashboard = Loadable({
  loader: () => import("../../views/page/GCL/Monitor/DockOutboundDashboard"),
  loading: Loading
});

const ListShuttle = Loadable({
  loader: () => import("../../views/page/GCL/Warehouse/ListShuttle"),
  loading: Loading
});

const routes = [

  { path: "/monitor/location", name: "Monitor Location", compoment: Monitor_Location, exact: true, child: true },
  { path: "/receive/mappingreceive", name: "GR HH", compoment: GR_PalletByHH, exact: true, child: true },
  { path: "/receive/registsht", name: "regis SH", compoment: RegistShuttle, exact: true, child: true },

  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  { path: "/receive/search", name: "GR Search", compoment: GR_Search, exact: true },
  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  //{ path: "/receive/detail", name: "GR Create", compoment: GR_Detail, exact: true },

  { path: "/receive/putawaycreate", name: "PA Create", compoment: PA_Create, exact: true },
  { path: "/receive/putawaysearch", name: "PA Search", compoment: PA_Search, exact: true },
  { path: "/receive/manualcreate", name: "GR HH", compoment: CreateGRByQR, exact: true },

  { path: "/issue/create", name: "GI Create", compoment: GI_Create, exact: true },
  { path: "/issue/search", name: "GI View", compoment: GI_Search, exact: true },
  { path: "/issue/manualcreate", name: "GI HH", compoment: CreateGIByQR, exact: true },
  { path: "/issue/managequeue", name: "GI Manage Queue", compoment: GI_WorkQueue, exact: true },

  { path: "/issue/pickingcreate", name: "PK Create", compoment: PK_Create, exact: true },
  { path: "/issue/pickingsearch", name: "PK Search", compoment: PK_Search, exact: true },
  { path: "/setting/registsht", name: "PK Search", compoment: RegistShuttle, exact: true },

  { path: "/receive/monitorreceive", name: "Monitor Receive", compoment: MonitorReceive, exact: true, child: true },
  { path: "/receive/scanreceivegatemapping", name: "Scan Receive Gate Mapping", compoment: ScanReceiveGateMapping, exact: true, child: true },
  { path: "/issue/pickingmonitor", name: "Picking Monitor", compoment: PickingMonitor, exact: true, child: true },
  { path: "/warehouse/scanshuttlecheckin", name: "Scan Shuttle Check-In", compoment: ScanShuttleCheckIn, exact: true, child: true },
  { path: "/warehouse/scanshuttlecheckout", name: "Scan Shuttle Check-Out", compoment: ScanShuttleCheckOut, exact: true, child: true },
  { path: "/monitor/listshuttle", name: "List Shuttle", compoment: ListShuttle, exact: true, child: true },

  { path: "/monitor/dockoutbounddashboard", name: "Dock Outbound Dashboard", compoment: DockOutboundDashboard, exact: true, child: true },
];

export default routes;

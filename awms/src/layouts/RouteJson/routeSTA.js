import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentViewSTA = Loadable({
  loader: () => import("../../views/page/STA/Receive/DocumentViewGR"),
  loading: Loading
});
const CreateDocGISTA = Loadable({
  loader: () => import("../../views/page/STA/Issues/CreateDocGI"),
  loading: Loading
});
const StorageObjectSTA = Loadable({
  loader: () => import("../../views/page/STA/Report/StorageObject"),
  loading: Loading
});
const DocumentSearchSTA = Loadable({
  loader: () => import("../../views/page/STA/Receive/DocumentSearchSTA"),
  loading: Loading
});
const DocumentSearchGISTA = Loadable({
  loader: () => import("../../views/page/STA/Issues/DocumentSearchGISTA"),
  loading: Loading
});
const DocumentViewGISTA = Loadable({
  loader: () => import("../../views/page/STA/Issues/DocumentViewGI"),
  loading: Loading
});
const DocumentSearchPISTA = Loadable({
  loader: () => import("../../views/page/STA/Audit/DocumentSearchPISTA"),
  loading: Loading
});
const DocumentViewPISTA = Loadable({
  loader: () => import("../../views/page/STA/Audit/DocumentViewPI"),
  loading: Loading
});
const CreateDocPISTA = Loadable({
  loader: () => import("../../views/page/STA/Audit/CreateDocPI"),
  loading: Loading
});
const Scanbarcode = Loadable({
  loader: () => import("../../views/page/STA/Dashboard/Scanbarcode"),
  loading: Loading
});
const mappingReturnPallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/MappingReturnPallet"),
  loading: Loading
});
const mappingEmptyPallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/MappingEmptyPallet"),
  loading: Loading
});
const pickingReturn = Loadable({
  loader: () => import("../../views/page/Issue/PickingReturn"),
  loading: Loading
});

const CountingAdj = Loadable({
  loader: () => import("../../views/page/STA/Audit/CountingAdj"),
  loading: Loading
});
const ProcessQueueGI = Loadable({
  loader: () => import("../../views/page/STA/Issues/WorkQueueSTA"),
  loading: Loading
});
const ProcessQueueCT = Loadable({
  loader: () => import("../../views/page/STA/Audit/WorkQueueSTACounting"),
  loading: Loading
});
const dashboardPickingJob = Loadable({
  loader: () => import("../../views/page/STA/Dashboard/DashboardPickingJob"),
  loading: Loading
});
const ReceiveWIPSup = Loadable({
  loader: () => import("../../views/page/STA/Receive/ReceiveWIPSup"),
  loading: Loading
});

const routes = [
  { path: "/dashboard/scanreceiveproduct", name: "Scan Receive Product Line", compoment: Scanbarcode, exact: true },
  { path: "/receive/detail", name: "base5", compoment: DocumentViewSTA, exact: true },
  { path: "/receive/search", name: "Search GR", compoment: DocumentSearchSTA, exact: true },
  { path: "/receive/receiveforcustomer", name: "Mapping Return Pallet", compoment: mappingReturnPallet, exact: true },
  { path: "/receive/scanemptypallet", name: "Mapping Empty Pallet", compoment: mappingEmptyPallet, exact: true },
  { path: "/receive/receivewipsup", name: "Receive WIP Supplier", compoment: ReceiveWIPSup, exact: true },
  { path: "/issue/scanpickingreturn", name: "Picking Return", compoment: pickingReturn, exact: true },
  { path: "/issue/search", name: "base5", compoment: DocumentSearchGISTA, exact: true },
  { path: "/issue/create", name: "base5", compoment: CreateDocGISTA, exact: true },
  { path: "/issue/detail", name: "base5", compoment: DocumentViewGISTA, exact: true },
  { path: "/dashboard/pickingjobs", name: "TestRedirect", compoment: dashboardPickingJob, exact: true },
  { path: "/counting/search", name: "base5", compoment: DocumentSearchPISTA, exact: true },
  { path: "/counting/detail", name: "base5", compoment: DocumentViewPISTA, exact: true },
  { path: "/counting/create", name: "base5", compoment: CreateDocPISTA, exact: true },
  { path: "/warehouse/storageobject", name: "base5", compoment: StorageObjectSTA, exact: true },
  { path: "/counting/adjust", name: "CountingAdj", compoment: CountingAdj, exact: true },
  { path: "/issue/managequeue", name: "base5", compoment: ProcessQueueGI, exact: true },
  { path: "/counting/managequeue", name: "base5", compoment: ProcessQueueCT, exact: true },
];

export default routes;

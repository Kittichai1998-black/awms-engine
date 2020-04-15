import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const Test1 = Loadable({
  loader: () => import("../../views/page/TableExample"),
  loading: Loading
});
const Test2 = Loadable({
  loader: () => import("../../views/page/test2"),
  loading: Loading
});
const Test3 = Loadable({
  loader: () => import("../../views/page/test3"),
  loading: Loading
});
const Test444 = Loadable({
  loader: () => import("../../views/page/test444"),
  loading: Loading
});
const Testpage = Loadable({
  loader: () => import("../../views/page/Testpage"),
  loading: Loading
});
const test7 = Loadable({
  loader: () => import("../../views/page/test7"),
  loading: Loading
});
const TestReport = Loadable({
  loader: () => import("../../views/page/TestReport"),
  loading: Loading
});
const ReportStc = Loadable({
  loader: () => import("../../views/page/ReportStc"),
  loading: Loading
});
const CreateDoc = Loadable({
  loader: () => import("../../views/page/TestCreateDocument"),
  loading: Loading
});
const testMaster = Loadable({
  loader: () => import("../../views/page/testMaster"),
  loading: Loading
});
const DocumentSearch = Loadable({
  loader: () => import("../../views/page/DocumentSearchExample"),
  loading: Loading
});
const Scanbarcode = Loadable({
  loader: () => import("../../views/page/STA/Dashboard/Scanbarcode"),
  loading: Loading
});
const Checkbox = Loadable({
  loader: () => import("../../views/page/TestCheckbox"),
  loading: Loading
});
const TestProcess = Loadable({
  loader: () => import("../../views/page/TestProcess"),
  loading: Loading
});
const StorageObjectExample = Loadable({
  loader: () => import("../../views/page/StorageObjectExample"),
  loading: Loading
});
const mappingReturnPallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/CustomerReturnPallet"),
  loading: Loading
});
const mappingEmptyPallet = Loadable({
  loader: () => import("../../views/page/AAI/Receive/ReceiveEmptyPallet"),
  loading: Loading
});
const pickingReturn = Loadable({
  loader: () => import("../../views/page/STA/Issues/PickingReturn"),
  loading: Loading
});
const TestAmRedirectInfo = Loadable({
  loader: () => import("../../views/page/TestAmRedirectInfo"),
  loading: Loading
});
const DocumentViewPISTA = Loadable({
  loader: () => import("../../views/page/STA/Audit/DocumentViewPI"),
  loading: Loading
});
const ScanPalletInfo = Loadable({
  loader: () => import("../../views/page/Warehouse/ScanPalletInfo"),
  loading: Loading
});
const testDashboard = Loadable({
  loader: () => import("../../views/page/testDashboard"),
  loading: Loading
});
const CountingAdj = Loadable({
  loader: () => import("../../views/page/MRK/Counting/CountingAdj"),
  loading: Loading
});
const TestProcessQueueV2 = Loadable({
  loader: () => import("../../views/page/TestProcessQueueV2"),
  loading: Loading
});
const TestWaveManagement = Loadable({
  loader: () => import("../../views/page/TestWaveManagement"),
  loading: Loading
});
const TableV2 = Loadable({
  loader: () => import("../../views/page/TableInDev"),
  loading: Loading
});
const TableV3 = Loadable({
  loader: () => import("../../views/page/TableInDev2"),
  loading: Loading
});

const GR_Create = Loadable({
  loader: () => import("../../views/page/ENGINE/GR/GR_Create"),
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
const GI_Create = Loadable({
  loader: () => import("../../views/page/ENGINE/GI/GI_Create"),
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

const routes = [
  {
    path: "/monitor/picking",
    name: "Monitor Picking",
    compoment: MonitorPicking,
    exact: true
  },

  {
    path: "/receive/create",
    name: "GR Create",
    compoment: GR_Create,
    exact: true
  },
  {
    path: "/receive/detail",
    name: "GR View",
    compoment: GR_Detail,
    exact: true
  },
  {
    path: "/receive/search",
    name: "GR View",
    compoment: GR_Search,
    exact: true
  },

  {
    path: "/issue/create",
    name: "GI Create",
    compoment: GI_Create,
    exact: true
  },
  { path: "/issue/detail", name: "GI View", compoment: GI_Detail, exact: true },
  { path: "/issue/search", name: "GI View", compoment: GI_Search, exact: true },
  {
    path: "/issue/managequeue",
    name: "GI Manage Queue",
    compoment: GI_WorkQueue,
    exact: true
  },


  {
    path: "/counting/manualcounting",
    name: "base5",
    compoment: CountingAdj,
    exact: true
  },
  { path: "/test", name: "base1", compoment: Test1, exact: true },
  { path: "/doc/gi/list", name: "base2", compoment: Test2, exact: true },
  { path: "/doc/gi/create", name: "base3", compoment: Test3, exact: true },
  {
    path: "/sys/sto/checkpallet",
    name: "base4",
    compoment: Test444,
    exact: true
  },
  { path: "/Testpage/Dia/Ra", name: "base5", compoment: Testpage, exact: true },
  { path: "/testreport", name: "base5", compoment: TestReport, exact: true },
  { path: "/reportstc", name: "base5", compoment: ReportStc, exact: true },
  { path: "/wm/sto/test7", name: "base5", compoment: test7, exact: true },
  {
    path: "/wm/sto/testCrateDoc",
    name: "base5",
    compoment: CreateDoc,
    exact: true
  },
  {
    path: "/wm/sto/DocumentSearch",
    name: "DocumentSearch",
    compoment: DocumentSearch,
    exact: true
  },
  {
    path: "/wm/sto/testMaster",
    name: "base5",
    compoment: testMaster,
    exact: true
  },
  {
    path: "/wm/sto/scan",
    name: "Scanbarcode",
    compoment: Scanbarcode,
    exact: true
  },
  {
    path: "/wm/sto/Checkbox",
    name: "Scanbarcode",
    compoment: Checkbox,
    exact: true
  },
  {
    path: "/wm/sto/Testprocess",
    name: "TestProcess",
    compoment: TestProcess,
    exact: true
  },
  {
    path: "/wm/sto/testMaster",
    name: "base5",
    compoment: testMaster,
    exact: true
  },
  {
    path: "/wm/sto/Warehouse",
    name: "base5",
    compoment: StorageObjectExample,
    exact: true
  },
  {
    path: "/counting/detail",
    name: "base5",
    compoment: DocumentViewPISTA,
    exact: true
  },
  {
    path: "/receive/receiveforcustomer",
    name: "Customers Return Pallet",
    compoment: mappingReturnPallet,
    exact: true
  },
  {
    path: "/receive/receivemptypallet",
    name: "Mapping Empty Pallet",
    compoment: mappingEmptyPallet,
    exact: true
  },
  {
    path: "/issue/pickingreturn",
    name: "Picking Return",
    compoment: pickingReturn,
    exact: true
  },
  {
    path: "/warehouse/checkpallet",
    name: "Scan Pallet Information",
    compoment: ScanPalletInfo,
    exact: true
  },
  {
    path: "/wm/sto/TestAmRedi",
    name: "TestRedirect",
    compoment: TestAmRedirectInfo,
    exact: true
  },
  {
    path: "/testdashboard",
    name: "TestRedirect",
    compoment: testDashboard,
    exact: true
  },
  {
    path: "/tpcq",
    name: "TestProcessQueue ",
    compoment: TestProcessQueueV2,
    exact: true
  },
  {
    path: "/twmn",
    name: "TestWaveManagement",
    compoment: TestWaveManagement,
    exact: true
  },
  { path: "/tbid", name: "TableV2", compoment: TableV2, exact: true },
  { path: "/tbidV2", name: "TableV2", compoment: TableV3, exact: true }
  // { path: "/dashboard", name: "Dashboard IN/OUT", compoment: dashboard_in_out, exact: true }
];

export default routes;

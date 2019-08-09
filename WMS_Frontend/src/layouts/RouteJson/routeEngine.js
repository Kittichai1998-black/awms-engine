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
const routes = [
  {
    path: "/counting/manualcounting",
    name: "base5",
    compoment: CountingAdj,
    exact: true
  },
  { path: "/doc/gr/list", name: "base1", compoment: Test1, exact: true },
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
  }
  // { path: "/dashboard", name: "Dashboard IN/OUT", compoment: dashboard_in_out, exact: true }
];

export default routes;

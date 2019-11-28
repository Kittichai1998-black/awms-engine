import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentViewSTA = Loadable({
  loader: () => import("../../views/page/STA/Receive/DocumentViewGR"),
  loading: Loading
});
const CreateDocGISTACus = Loadable({
  loader: () => import("../../views/page/STA/Issues/CreateDocGICus"),
  loading: Loading
});
const CreateDocGIWipWare = Loadable({
  loader: () => import("../../views/page/STA/Issues/CreateDocGIWipWare"),
  loading: Loading
});
const CreateDocGIEmpty = Loadable({
  loader: () => import("../../views/page/STA/Issues/CreateDocGIEmpty"),
  loading: Loading
});
const CreateDocGISTAWare = Loadable({
  loader: () => import("../../views/page/STA/Issues/CreateDocGIWare"),
  loading: Loading
});
const StorageObjectSTA = Loadable({
  loader: () => import("../../views/page/STA/Warehouse/StorageObject"),
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
const DocumentViewGISTACUS = Loadable({
  loader: () => import("../../views/page/STA/Issues/DocumentViewGICUS"),
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
const CustomerReturnPallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/CustomerReturnPallet"),
  loading: Loading
});
const CustomerReturnPalletByBarcode = Loadable({
  loader: () =>
    import("../../views/page/STA/Receive/CustomerReturnPalletByBarcode"),
  loading: Loading
});
const ReceiveEmptyPallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/ReceiveEmptyPallet"),
  loading: Loading
});
const PickingReturn = Loadable({
  loader: () => import("../../views/page/STA/Issues/PickingReturn"),
  loading: Loading
});
const PickingReturnByBarcode = Loadable({
  loader: () => import("../../views/page/STA/Issues/PickingReturnByBarcode"),
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
const dashboardCountingJob = Loadable({
  loader: () => import("../../views/page/STA/Dashboard/DashboardCountingJob"),
  loading: Loading
});
const ReceivePallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/ReceivePallet"),
  loading: Loading
});
const ReceivePalletByBarcode = Loadable({
  loader: () => import("../../views/page/STA/Receive/ReceivePalletByBarcode"),
  loading: Loading
});
const ReceiveWIPSup = Loadable({
  loader: () => import("../../views/page/STA/Receive/ReceiveWIPSup"),
  loading: Loading
});
const LoadingReturn = Loadable({
  loader: () => import("../../views/page/STA/Issues/ReturnLoad"),
  loading: Loading
});
const LoadingReturnByBarcode = Loadable({
  loader: () => import("../../views/page/STA/Issues/ReturnLoadByBarcode"),
  loading: Loading
});
const CurrentInventory = Loadable({
  loader: () => import("../../views/page/STA/Report/CurrentInventory"),
  loading: Loading
});
const StockCard = Loadable({
  loader: () => import("../../views/page/STA/Report/StockCard"),
  loading: Loading
});
const DailySTOReceive = Loadable({
  loader: () => import("../../views/page/STA/Report/DailySTOReceive"),
  loading: Loading
});
const DailySTOIssue = Loadable({
  loader: () => import("../../views/page/STA/Report/DailySTOIssue"),
  loading: Loading
});
const DailySTOCounting = Loadable({
  loader: () => import("../../views/page/STA/Report/DailySTOCounting"),
  loading: Loading
});
const DailySTOSumReceive = Loadable({
  loader: () => import("../../views/page/STA/Report/DailySTOSumReceive"),
  loading: Loading
});
const DailySTOSumIssue = Loadable({
  loader: () => import("../../views/page/STA/Report/DailySTOSumIssue"),
  loading: Loading
});
const DailySTOSumCounting = Loadable({
  loader: () => import("../../views/page/STA/Report/DailySTOSumCounting"),
  loading: Loading
});

const SKUMasterType = Loadable({
  loader: () => import("../../views/page/STA/Master/SKUMasterType"),
  loading: Loading
});
const PackMaster = Loadable({
  loader: () => import("../../views/page/STA/Master/PackMaster"),
  loading: Loading
});
const SKUMaster = Loadable({
  loader: () => import("../../views/page/STA/Master/SKUMaster"),
  loading: Loading
});
const ObjectSizeMap = Loadable({
  loader: () => import("../../views/page/Master/ObjectSizeMap"),
  loading: Loading
});
const ScanPalletInfo = Loadable({
  loader: () => import("../../views/page/STA/Warehouse/ScanPalletInfo"),
  loading: Loading
});
const ReportStorageObject = Loadable({
  loader: () => import("../../views/page/STA/Report/StorageObject"),
  loading: Loading
});

const routes = [
  {
    path: "/report/storageobject",
    name: "Issue Report",
    compoment: ReportStorageObject,
    exact: true
  },
  {
    path: "/setting/sku",
    name: "SKU",
    compoment: SKUMaster,
    exact: true
  },
  {
    path: "/setting/skutype",
    name: "SKU Type",
    compoment: SKUMasterType,
    exact: true
  },
  {
    path: "setting/skuconvertor",
    name: "SKU Convertor",
    compoment: PackMaster,
    exact: true
  },
  {
    path: "setting/ObjectSizeMap",
    name: "ObjectSizeMap",
    compoment: ObjectSizeMap,
    exact: true
  },
  {
    path: "/dashboard/scanreceiveproduct",
    name: "Scan Receive Product Line",
    compoment: Scanbarcode,
    exact: true
  },
  {
    path: "/receive/detail",
    name: "base5",
    compoment: DocumentViewSTA,
    exact: true
  },
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchSTA,
    exact: true
  },
  {
    path: "/receive/receiveforcustomerByQR",
    name: "Customers Return",
    compoment: CustomerReturnPalletByBarcode,
    exact: true
  },
  {
    path: "/receive/receiveforcustomer",
    name: "Customers Return",
    compoment: CustomerReturnPallet,
    exact: true
  },
  {
    path: "/receive/receivemptypallet",
    name: "Empty Pallet",
    compoment: ReceiveEmptyPallet,
    exact: true
  },
  {
    path: "/receive/receivefg",
    name: "Receive FG",
    compoment: ReceivePallet,
    exact: true
  },
  {
    path: "/receive/receivefgByQR",
    name: "Receive FG",
    compoment: ReceivePalletByBarcode,
    exact: true
  },
  {
    path: "/receive/receivewipsup",
    name: "Receive WIP Supplier",
    compoment: ReceiveWIPSup,
    exact: true
  },
  {
    path: "/issue/loadingreturn",
    name: "Loading Return",
    compoment: LoadingReturn,
    exact: true
  },
  {
    path: "/issue/loadingreturnByQR",
    name: "Loading Return",
    compoment: LoadingReturnByBarcode,
    exact: true
  },
  {
    path: "/issue/pickingreturn",
    name: "Picking Return",
    compoment: PickingReturn,
    exact: true
  },
  {
    path: "/issue/pickingreturnByQR",
    name: "Picking Return",
    compoment: PickingReturnByBarcode,
    exact: true
  },
  {
    path: "/issue/search",
    name: "base5",
    compoment: DocumentSearchGISTA,
    exact: true
  },
  {
    path: "/issue/createCus",
    name: "base5",
    compoment: CreateDocGISTACus,
    exact: true
  },
  {
    path: "/issue/createWm",
    name: "base5",
    compoment: CreateDocGISTAWare,
    exact: true
  },
  {
    path: "/issue/createWipWm",
    name: "base5",
    compoment: CreateDocGIWipWare,
    exact: true
  },
  {
    path: "/issue/createEmpWm",
    name: "base5",
    compoment: CreateDocGIEmpty,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "base5",
    compoment: DocumentViewGISTA,
    exact: true
  },
  {
    path: "/issue/detailCus",
    name: "base5",
    compoment: DocumentViewGISTACUS,
    exact: true
  },
  {
    path: "/dashboard/pickingjobs",
    name: "TestRedirect",
    compoment: dashboardPickingJob,
    exact: true
  },
  {
    path: "/dashboard/countingjobs",
    name: "TestRedirect",
    compoment: dashboardCountingJob,
    exact: true
  },
  {
    path: "/counting/search",
    name: "base5",
    compoment: DocumentSearchPISTA,
    exact: true
  },
  {
    path: "/counting/detail",
    name: "base5",
    compoment: DocumentViewPISTA,
    exact: true
  },
  {
    path: "/counting/create",
    name: "base5",
    compoment: CreateDocPISTA,
    exact: true
  },
  {
    path: "/warehouse/storageobject",
    name: "base5",
    compoment: StorageObjectSTA,
    exact: true
  },
  {
    path: "/counting/manualcounting",
    name: "CountingAdj",
    compoment: CountingAdj,
    exact: true
  },
  {
    path: "/issue/managequeue",
    name: "base5",
    compoment: ProcessQueueGI,
    exact: true
  },
  {
    path: "/counting/managequeue",
    name: "base5",
    compoment: ProcessQueueCT,
    exact: true
  },
  {
    path: "/report/currentinventory",
    name: "Current Inventory",
    compoment: CurrentInventory,
    exact: true
  },
  {
    path: "/report/stockcard",
    name: "StockCard",
    compoment: StockCard,
    exact: true
  },
  {
    path: "/report/receive",
    name: "Receive Report",
    compoment: DailySTOReceive,
    exact: true
  },
  {
    path: "/report/issue",
    name: "Issue Report",
    compoment: DailySTOIssue,
    exact: true
  },
  {
    path: "/report/counting",
    name: "Counting Report",
    compoment: DailySTOCounting,
    exact: true
  },
  {
    path: "/report/dailyreceivesum",
    name: "Receive Summary Report ",
    compoment: DailySTOSumReceive,
    exact: true
  },
  {
    path: "/report/dailyissuesum",
    name: "Issue Summary Report ",
    compoment: DailySTOSumIssue,
    exact: true
  },
  {
    path: "/report/dailycountsum",
    name: "Counting Summary Report ",
    compoment: DailySTOSumCounting,
    exact: true
  },
  {
    path: "/warehouse/checkpallet",
    name: "Scan Pallet Information",
    compoment: ScanPalletInfo,
    exact: true
  }
];

export default routes;

import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const Home = Loadable({
  loader: () => import("../../views/page/Pages/Home"),
  loading: Loading
});
const ButtonInputExcel = Loadable({
  loader: () => import("../../views/page/ButtonInputExcel"),
  loading: Loading
});
const FindpopupDDL = Loadable({
  loader: () => import("../../views/page/FindpopupDDL"),
  loading: Loading
});
// const Picking = Loadable({
//   loader: () => import('../../views/page/Dashboard/Picking'),
//   loading: Loading
// });
const SKUMaster = Loadable({
  loader: () => import("../../views/page/Master/SKUMaster"),
  loading: Loading
});
const PackMaster = Loadable({
  loader: () => import("../../views/page/Master/PackMaster"),
  loading: Loading
});
const SKUMasterType = Loadable({
  loader: () => import("../../views/page/Master/SKUMasterType"),
  loading: Loading
});
const PackMasterType = Loadable({
  loader: () => import("../../views/page/Master/PackMasterType"),
  loading: Loading
});
const BaseMaster = Loadable({
  loader: () => import("../../views/page/Master/BaseMaster"),
  loading: Loading
});
const BaseMasterType = Loadable({
  loader: () => import("../../views/page/Master/BaseMasterType"),
  loading: Loading
});
const BranchMaster = Loadable({
  loader: () => import("../../views/page/Master/BranchMaster"),
  loading: Loading
});
const WarehouseMaster = Loadable({
  loader: () => import("../../views/page/Master/Warehouse"),
  loading: Loading
});
const AreaMaster = Loadable({
  loader: () => import("../../views/page/Master/AreaMaster"),
  loading: Loading
});
const AreaLocationMaster = Loadable({
  loader: () => import("../../views/page/Master/AreaLocationMaster"),
  loading: Loading
});
const AreaRoute = Loadable({
  loader: () => import("../../views/page/Master/AreaRoute"),
  loading: Loading
});
const Customer = Loadable({
  loader: () => import("../../views/page/Master/Customer"),
  loading: Loading
});
const Supplier = Loadable({
  loader: () => import("../../views/page/Master/Supplier"),
  loading: Loading
});
const User = Loadable({
  loader: () => import("../../views/page/Master/User"),
  loading: Loading
});
const ObjectSize = Loadable({
  loader: () => import("../../views/page/Master/ObjectSize"),
  loading: Loading
});
const ObjectSizeMap = Loadable({
  loader: () => import("../../views/page/Master/ObjectSizeMap"),
  loading: Loading
});
const StorageObject = Loadable({
  loader: () => import("../../views/page/Warehouse/StorageObject"),
  loading: Loading
});
const ScanPalletInfo = Loadable({
  loader: () => import("../../views/page/Warehouse/ScanPalletInfo"),
  loading: Loading
});
const CurrentInventory = Loadable({
  loader: () => import("../../views/page/Report/CurrentInventory"),
  loading: Loading
});
const StockCard = Loadable({
  loader: () => import("../../views/page/Report/StockCard"),
  loading: Loading
});
const DailySTOReceive = Loadable({
  loader: () => import("../../views/page/Report/DailySTOReceive"),
  loading: Loading
});
const DailySTOIssue = Loadable({
  loader: () => import("../../views/page/Report/DailySTOIssue"),
  loading: Loading
});
const DailySTOCounting = Loadable({
  loader: () => import("../../views/page/Report/DailySTOCounting"),
  loading: Loading
});
const DailySTOSumReceive = Loadable({
  loader: () => import("../../views/page/Report/DailySTOSumReceive"),
  loading: Loading
});
const DailySTOSumIssue = Loadable({
  loader: () => import("../../views/page/Report/DailySTOSumIssue"),
  loading: Loading
});
const DailySTOSumCounting = Loadable({
  loader: () => import("../../views/page/Report/DailySTOSumCounting"),
  loading: Loading
});
const ScanPalletMove = Loadable({
  loader: () => import("../../views/page/Warehouse/ScanPalletMoveLocation.js"),
  loading: Loading
});
const APIKey = Loadable({
  loader: () => import("../../views/page/Master/APIKey"),
  loading: Loading
});
const Permission = Loadable({
  loader: () => import("../../views/page/Master/Permission"),
  loading: Loading
});
const MonitorIO = Loadable({
  loader: () => import("../../views/page/Monitor/MonitorIO"),
  loading: Loading
});
const TestPicking = Loadable({
  loader: () => import("../../views/page/PickingExample"),
  loading: Loading
});
const CountingAdj = Loadable({
  loader: () => import("../../views/page/MRK/Counting/CountingAdj"),
  loading: Loading
});
const TestCreateDocument = Loadable({
  loader: () => import("../../views/page/TestCreateDocument"),
  loading: Loading
});
const ReceivePallet = Loadable({
  loader: () => import("../../views/page/STA/Receive/ReceivePallet"),
  loading: Loading
});
const LocationSummary = Loadable({
  loader: () => import("../../views/pageComponent/AmLocationSummary"),
  loading: Loading
});
const testMasterV2 = Loadable({
  loader: () => import("../../views/page/testMasterV2"),
  loading: Loading
});
const APIServiceLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/APIServiceLog"),
  loading: Loading
});
const SendAPILog = Loadable({
  loader: () => import("../../views/page/LogTransaction/SendAPILog"),
  loading: Loading
});
const StorageObjectLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/StorageObjectLog"),
  loading: Loading
});
const WorkQueueLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/WorkQueueLog"),
  loading: Loading
});
const DocumentLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/DocumentLog"),
  loading: Loading
});
const DocumentItemLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/DocumentItemLog"),
  loading: Loading
});
const DocumentItemStorageObjectLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/DocumentItemStorageObjectLog"),
  loading: Loading
});
let routes = [
  { path: "/", name: "base", compoment: Home, exact: true },
  {
    path: "/counting/manualcounting",
    name: "base5",
    compoment: CountingAdj,
    exact: true
  },
  {
    path: "/testMasterV2",
    name: "base5",
    compoment: testMasterV2,
    exact: true
  },
  {
    path: "/TestPicking",
    name: "Inbound Progress",
    compoment: TestPicking,
    exact: true
  },
  {
    path: "/monitor/receiving",
    name: "Inbound Progress",
    compoment: MonitorIO,
    exact: true
  },
  {
    path: "/monitor/issuing",
    name: "Outbound Progress",
    compoment: MonitorIO,
    exact: true
  },
  // {path: "/dashboard/picking",name: "Pickiing Progress",compoment: Picking,exact: true},
  // {path: "/dashboard/pickingjobs",name: "Dashboard Gate Picking Return by GR",compoment: dashboardReturnPicking,exact: true},
  {
    path: "/warehouse/storageobject",
    name: "Storage Object",
    compoment: StorageObject,
    exact: true
  },
  {
    path: "/warehouse/scanpalletmove",
    name: "Scan Pallet Move",
    compoment: ScanPalletMove,
    exact: true
  },
  {
    path: "/warehouse/checkpallet",
    name: "Scan Pallet Information",
    compoment: ScanPalletInfo,
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
    path: "/setting/skuconvertor",
    name: "base5",
    compoment: PackMaster,
    exact: true
  },
  { path: "/setting/sku", name: "base5", compoment: SKUMaster, exact: true },
  {
    path: "/setting/skutype",
    name: "base5",
    compoment: SKUMasterType,
    exact: true
  },
  {
    path: "/setting/packtype/manage",
    name: "base5",
    compoment: PackMasterType,
    exact: true
  },
  {
    path: "/setting/pallet",
    name: "base5",
    compoment: BaseMaster,
    exact: true
  },
  {
    path: "/setting/pallettype",
    name: "base5",
    compoment: BaseMasterType,
    exact: true
  },
  {
    path: "/setting/branch",
    name: "base5",
    compoment: BranchMaster,
    exact: true
  },
  {
    path: "/setting/warehouse",
    name: "base5",
    compoment: WarehouseMaster,
    exact: true
  },
  { path: "/setting/area", name: "base5", compoment: AreaMaster, exact: true },
  {
    path: "/setting/arealocation",
    name: "base5",
    compoment: AreaLocationMaster,
    exact: true
  },
  {
    path: "/setting/arearoute",
    name: "base5",
    compoment: AreaRoute,
    exact: true
  },
  {
    path: "/setting/customer",
    name: "base5",
    compoment: Customer,
    exact: true
  },
  {
    path: "/setting/supplier",
    name: "base5",
    compoment: Supplier,
    exact: true
  },
  { path: "/setting/user", name: "base5", compoment: User, exact: true },
  {
    path: "/setting/permission",
    name: "base5",
    compoment: Permission,
    exact: true
  },
  {
    path: "/setting/skuvolume",
    name: "base5",
    compoment: ObjectSize,
    exact: true
  },
  {
    path: "/setting/ObjectSizeMap",
    name: "base5",
    compoment: ObjectSizeMap,
    exact: true
  },
  { path: "/setting/APIKey", name: "base5", compoment: APIKey, exact: true },
  {
    path: "/exbutton",
    name: "base5",
    compoment: ButtonInputExcel,
    exact: true
  },
  { path: "/exdropdown", name: "base5", compoment: FindpopupDDL, exact: true },
  {
    path: "/wm/sto/picking",
    name: "base5",
    compoment: FindpopupDDL,
    exact: true
  },
  {
    path: "/wm/issue/manage",
    name: "base5",
    compoment: ButtonInputExcel,
    exact: true
  },
  {
    path: "/receive/receivefg",
    name: "Receive FG",
    compoment: ReceivePallet,
    exact: true
  },
  {
    path: "/createdoc",
    name: "Receive FG",
    compoment: TestCreateDocument,
    exact: true
  },
  {
    path: "/warehouse/location_summary",
    name: "Location Summary",
    compoment: LocationSummary,
    exact: true
  },
  {
    path: "/log/apiservicelog",
    name: "API Service Log",
    compoment: APIServiceLog,
    exact: true
  },
  {
    path: "/log/sendapilog",
    name: "Send API Log",
    compoment: SendAPILog,
    exact: true
  },
  {
    path: "/log/storageobjectlog",
    name: "Storage Object Log",
    compoment: StorageObjectLog,
    exact: true
  },
  {
    path: "/log/documentlog",
    name: "Document Log",
    compoment: DocumentLog,
    exact: true
  },
  {
    path: "/log/docitemlog",
    name: "Document Item Log",
    compoment: DocumentItemLog,
    exact: true
  },
  {
    path: "/log/docitemstolog",
    name: "Document Item Storage Object Log",
    compoment: DocumentItemStorageObjectLog,
    exact: true
  },
  {
    path: "/log/workqueuelog",
    name: "Work Queue Log",
    compoment: WorkQueueLog,
    exact: true
  }
];

export default routes;

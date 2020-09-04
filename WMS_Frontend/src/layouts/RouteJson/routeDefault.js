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
const DevInfo = Loadable({
  loader: () => import("../../views/page/ENGINE/DevInfo"),
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
  loader: () => import("../../views/page/NewReport/CurrentInventory"),
  loading: Loading
});

const StockCardV2 = Loadable({
  loader: () => import("../../views/page/NewReport/StockCard"),
  loading: Loading
});
const StockCard = Loadable({
  loader: () => import("../../views/page/NewReport/StockCard"),
  loading: Loading
});
const DailySTOReceive = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOReceive"),
  loading: Loading
});

const DailySTOIssue = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOIssue"),
  loading: Loading
});

const DailySTOCounting = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOCounting"),
  loading: Loading
});

const DailySTOAudit = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOAudit"),
  loading: Loading
});

const DailyLoad = Loadable({
  loader: () => import("../../views/page/NewReport/DailyLoad"),
  loading: Loading
});
const StorageObjectReport = Loadable({
  loader: () => import("../../views/page/NewReport/StorageObject"),
  loading: Loading
});
const DailySTOSumReceive = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOSumReceive"),
  loading: Loading
});
const DailySTOSumIssue = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOSumIssue"),
  loading: Loading
});

const DailySTOSumCounting = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOSumCounting"),
  loading: Loading
});

const DailySTOSumAudit = Loadable({
  loader: () => import("../../views/page/NewReport/DailySTOSumAudit"),
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
const MonitorPicking = Loadable({
  loader: () => import("../../views/page/ENGINE/Monitor/MonitorPicking"),
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
const ShipmentLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/ShipmentPlanLog"),
  loading: Loading
});
const TransportObjectLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/TransportObjectLog"),
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
  loader: () =>
    import("../../views/page/LogTransaction/DocumentItemStorageObjectLog"),
  loading: Loading
});
const WaveLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/WaveLog"),
  loading: Loading
});
const WaveSeqLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/WaveSeqLog"),
  loading: Loading
});
const WorkQueue = Loadable({
  loader: () => import("../../views/page/Warehouse/WorkQueue"),
  loading: Loading
});

const DownloadLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/DownloadLog"),
  loading: Loading
});
const SearchLog = Loadable({
  loader: () => import("../../views/page/LogTransaction/SearchLogRef"),
  loading: Loading
});
const Dash = Loadable({
  loader: () => import("../../views/page/Dashboard/ExDashboard"),
  loading: Loading
});
const WebPage = Loadable({
  loader: () => import("../../views/page/Master/WebPage"),
  loading: Loading
});
const TestPanel = Loadable({
  loader: () => import("../../views/page/TestPanel"),
  loading: Loading
});
const NotifyPage = Loadable({
  loader: () => import("../../views/page/ENGINE/AllNotify"),
  loading: Loading
});
const GR_PalletByHH = Loadable({
  loader: () => import("../../views/page/ENGINE/GR/GR_PalletByHH"),
  loading: Loading
});

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
const PK_Checker = Loadable({
  loader: () => import("../../views/page/ENGINE/PK/PK_Checker"),
  loading: Loading
});
const AD_Checker = Loadable({
  loader: () => import("../../views/page/ENGINE/AD/AD_Checker"),
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
const RePackaging = Loadable({
  loader: () => import("../../views/page/Warehouse/RePackaging"),
  loading: Loading
});
let routes = [
  { path: "/", name: "base", compoment: Home, exact: true },
  { path: "/counting/manualcounting", name: "base5", compoment: CountingAdj, exact: true },
  { path: "/setting/dev_info", name: "base5", compoment: DevInfo, exact: true },
  { path: "/testMasterV2", name: "base5", compoment: testMasterV2, exact: true },
  { path: "/TestPicking", name: "Inbound Progress", compoment: TestPicking, exact: true },
  { path: "/monitor/receiving", name: "Inbound Progress", compoment: MonitorIO, exact: true },
  { path: "/monitor/issuing", name: "Outbound Progress", compoment: MonitorIO, exact: true },
  { path: "/monitor/picking", name: "Monitor Picking", compoment: MonitorPicking, exact: true },
  // {path: "/dashboard/picking",name: "Pickiing Progress",compoment: Picking,exact: true},
  // {path: "/dashboard/pickingjobs",name: "Dashboard Gate Picking Return by GR",compoment: dashboardReturnPicking,exact: true},
  { path: "/warehouse/storageobject", name: "Storage Object", compoment: StorageObject, exact: true },
  { path: "/warehouse/scanpalletmove", name: "Scan Pallet Move", compoment: ScanPalletMove, exact: true },
  { path: "/warehouse/checkpallet", name: "Scan Pallet Information", compoment: ScanPalletInfo, exact: true },
  { path: "/report/currentinventory", name: "Current Inventory", compoment: CurrentInventory, exact: true },
  { path: "/report/stockcard", name: "StockCard", compoment: StockCard, exact: true },
  { path: "/report/receive", name: "Receive Report", compoment: DailySTOReceive, exact: true },
  { path: "/report/issue", name: "Issue Report", compoment: DailySTOIssue, exact: true },
  { path: "/report/counting", name: "Counting Report", compoment: DailySTOCounting, exact: true },
  { path: "/report/audit", name: "Audit Report", compoment: DailySTOAudit, exact: true },
  { path: "/report/load", name: "Load Report", compoment: DailyLoad, exact: true },
  { path: "/report/storageobject", name: "Storage Report", compoment: StorageObjectReport, exact: true },
  { path: "/report/dailyreceivesum", name: "Receive Summary Report ", compoment: DailySTOSumReceive, exact: true },
  { path: "/report/dailyissuesum", name: "Issue Summary Report ", compoment: DailySTOSumIssue, exact: true },
  { path: "/report/dailycountsum", name: "Counting Summary Report ", compoment: DailySTOSumCounting, exact: true },
  { path: "/report/dailyauditsum", name: "Audit Summary Report ", compoment: DailySTOSumAudit, exact: true },
  { path: "/setting/skuconvertor", name: "base5", compoment: PackMaster, exact: true },
  { path: "/setting/sku", name: "base5", compoment: SKUMaster, exact: true },
  { path: "/setting/skutype", name: "base5", compoment: SKUMasterType, exact: true },
  { path: "/setting/packtype/manage", name: "base5", compoment: PackMasterType, exact: true },
  { path: "/setting/pallet", name: "base5", compoment: BaseMaster, exact: true },
  { path: "/setting/pallettype", name: "base5", compoment: BaseMasterType, exact: true },
  { path: "/setting/branch", name: "base5", compoment: BranchMaster, exact: true },
  { path: "/setting/warehouse", name: "base5", compoment: WarehouseMaster, exact: true },
  { path: "/setting/area", name: "base5", compoment: AreaMaster, exact: true },
  { path: "/setting/arealocation", name: "base5", compoment: AreaLocationMaster, exact: true },
  { path: "/setting/arearoute", name: "base5", compoment: AreaRoute, exact: true },
  { path: "/setting/customer", name: "base5", compoment: Customer, exact: true },
  { path: "/setting/supplier", name: "base5", compoment: Supplier, exact: true },
  { path: "/setting/user", name: "base5", compoment: User, exact: true },
  { path: "/setting/permission", name: "base5", compoment: Permission, exact: true },
  { path: "/setting/skuvolume", name: "base5", compoment: ObjectSize, exact: true },
  { path: "/setting/ObjectSizeMap", name: "base5", compoment: ObjectSizeMap, exact: true },
  { path: "/setting/APIKey", name: "base5", compoment: APIKey, exact: true },
  { path: "/exbutton", name: "base5", compoment: ButtonInputExcel, exact: true },
  { path: "/exdropdown", name: "base5", compoment: FindpopupDDL, exact: true },
  { path: "/wm/sto/picking", name: "base5", compoment: FindpopupDDL, exact: true },
  { path: "/wm/issue/manage", name: "base5", compoment: ButtonInputExcel, exact: true },
  { path: "/receive/receivefg", name: "Receive FG", compoment: ReceivePallet, exact: true },
  { path: "/createdoc", name: "Receive FG", compoment: TestCreateDocument, exact: true },
  { path: "/warehouse/location_view", name: "Location Summary", compoment: LocationSummary, exact: true },
  { path: "/log/apiservicelog", name: "API Service Log", compoment: APIServiceLog, exact: true },
  { path: "/log/apipostlog", name: "Send API Log", compoment: SendAPILog, exact: true },
  { path: "/log/storageobjectlog", name: "Storage Object Log", compoment: StorageObjectLog, exact: true },
  { path: "/log/documentlog", name: "Document Log", compoment: DocumentLog, exact: true },
  { path: "/log/docitemlog", name: "Document Item Log", compoment: DocumentItemLog, exact: true },
  { path: "/log/docitemstolog", name: "Document Item Storage Object Log", compoment: DocumentItemStorageObjectLog, exact: true },
  { path: "/log/workqueuelog", name: "Work Queue Log", compoment: WorkQueueLog, exact: true },
  { path: "/log/shipmentlog", name: "Shipment Plan Log", compoment: ShipmentLog, exact: true },
  { path: "/log/transportlog", name: "Transport Object Log", compoment: TransportObjectLog, exact: true },
  { path: "/log/wavelog", name: "Wave Log", compoment: WaveLog, exact: true },
  { path: "/log/waveseqlog", name: "Wave Seq Log", compoment: WaveSeqLog, exact: true },
  { path: "/warehouse/workqueue", name: "Work Queue", compoment: WorkQueue, exact: true },
  { path: "/log/downloadlog", name: "Download Log File", compoment: DownloadLog, exact: true },
  { path: "/log/searchlog", name: "Search Log", compoment: SearchLog, exact: true },
  { path: "/dashboard/Dash", name: "Dash1", compoment: Dash, exact: true },
  { path: "/setting/webpage", name: "base5", compoment: WebPage, exact: true },
  { path: "/testpanel", name: "base5", compoment: TestPanel, exact: true },
  { path: "/notify", name: "Notify", compoment: NotifyPage, exact: true },

  { path: "/receive/create", name: "GR Create", compoment: GR_Create, exact: true },
  { path: "/receive/detail", name: "GR View", compoment: GR_Detail, exact: true },
  { path: "/receive/search", name: "GR View", compoment: GR_Search, exact: true },
  { path: "/receive/hh", name: "GR HH", compoment: GR_PalletByHH, exact: true },

  { path: "/receive/putawaycreate", name: "PA Create", compoment: PA_Create, exact: true },
  { path: "/receive/putawaydetail", name: "PA View", compoment: PA_Detail, exact: true },
  { path: "/receive/putawaysearch", name: "PA View", compoment: PA_Search, exact: true },

  { path: "/issue/pickingcreate", name: "PK Create", compoment: PK_Create, exact: true },
  { path: "/issue/pickingdetail", name: "PK View", compoment: PK_Detail, exact: true },
  { path: "/issue/pickingsearch", name: "PK View", compoment: PK_Search, exact: true },
  { path: "/issue/pickingchecker", name: "PK Checker", compoment: PK_Checker, exact: true },

  { path: "/issue/create", name: "GI Create", compoment: GI_Create, exact: true },
  { path: "/issue/detail", name: "GI View", compoment: GI_Detail, exact: true },
  { path: "/issue/search", name: "GI View", compoment: GI_Search, exact: true },
  // { path: "/issue/managequeue", name: "GI Manage Queue", compoment: GI_WorkQueue, exact: true },

  { path: "/shipment/create", name: "SO Create", compoment: SO_Create, exact: true },
  { path: "/shipment/detail", name: "SO View", compoment: SO_Detail, exact: true },
  { path: "/shipment/search", name: "SO View", compoment: SO_Search, exact: true },

  { path: "/counting/create", name: "AD Create", compoment: AD_Create, exact: true },
  { path: "/counting/detail", name: "AD View", compoment: AD_Detail, exact: true },
  { path: "/counting/search", name: "AD View", compoment: AD_Search, exact: true },
  { path: "/audit/auditchecker", name: "AD Checker", compoment: AD_Checker, exact: true },

  { path: "/sto/rePackaging", name: "Re Packaging", compoment: RePackaging, exact: true },
];

export default routes;

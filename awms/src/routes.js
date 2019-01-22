import React from 'react';
import Loadable from 'react-loadable'

import DefaultLayout from './containers/DefaultLayout';

function Loading() {
  return <div>Loading...</div>;
}

const Dashboard = Loadable({
  loader: () => import('./views/Dashboard'),
  loading: Loading,
});

 const Products = Loadable({
  loader: () => import('./views/Warehouse/MasterData/Product'),
  loading: Loading,
});

 const Pack = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Pack'),
   loading: Loading,
 });

 const PackType = Loadable({
   loader: () => import('./views/Warehouse/MasterData/PackType'),
   loading: Loading,
 }); 

 const Barcode = Loadable({
   loader: () => import('./views/Warehouse/Barcode'),
   loading: Loading,
 });

  const Customer = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Customer'),
   loading: Loading,
 });

 const Supplier = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Suppiler'),
   loading: Loading,
 });

 const Area = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Area'),
   loading: Loading,
 });

 const AreaType = Loadable({
   loader: () => import('./views/Warehouse/MasterData/AreaType'),
   loading: Loading,
 });

 const AreaLocation = Loadable({
   loader: () => import('./views/Warehouse/MasterData/AreaLocation'),
   loading: Loading,
 });

 const AreaRoute = Loadable({
   loader: () => import('./views/Warehouse/MasterData/AreaRoute'),
   loading: Loading,
 });

 const Base = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Base'),
   loading: Loading,
 });

 const BaseType = Loadable({
   loader: () => import('./views/Warehouse/MasterData/BaseType'),
   loading: Loading,
 });

 const Branch = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Branch'),
   loading: Loading,
 });

 const User = Loadable({
   loader: () => import('./views/Warehouse/MasterData/User'),
   loading: Loading,
 });

 const Warehouse = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Warehouse'),
   loading: Loading,
 });

 const Permission = Loadable({
   loader: () => import('./views/Warehouse/MasterData/Permission'),
   loading: Loading,
 });

 const APIServiceGroup = Loadable({
   loader: () => import('./views/Warehouse/MasterData/APIServiceGroup'),
   loading: Loading,
 });

 const APIService = Loadable({
   loader: () => import('./views/Warehouse/MasterData/APIService'),
   loading: Loading,
 });

 const SKUType = Loadable({
   loader: () => import('./views/Warehouse/MasterData/SKUType'),
   loading: Loading,
 });

 const ObjectSize = Loadable({
   loader: () => import('./views/Warehouse/MasterData/ObjectSize'),
   loading: Loading,
 });

 const JobScheduleModule = Loadable({
   loader: () => import('./views/Warehouse/MasterData/JobScheduleModule'),
   loading: Loading,
 });

 const UnitType = Loadable({
   loader: () => import('./views/Warehouse/MasterData/UnitType'),
   loading: Loading,
 });

 const WebControl = Loadable({
   loader: () => import('./views/Warehouse/MasterData/WebControl'),
   loading: Loading,
 });

 const WebPage = Loadable({
   loader: () => import('./views/Warehouse/MasterData/WebPage'),
   loading: Loading,
 });

 const WebPageGroup = Loadable({
   loader: () => import('./views/Warehouse/MasterData/WebPageGroup'),
   loading: Loading,
 }); 

const Storage = Loadable({
  loader: () => import('./views/Warehouse/StorageReport/StorageReport'),
  loading: Loading,
});

const History = Loadable({
  loader: () => import('./views/Warehouse/Storage/History'),
  loading: Loading,
});

const InboundManagement = Loadable({
  loader: () => import('./views/Warehouse/StorageManagement/InboundManagement'),
  loading: Loading,
});

const InboundView = Loadable({
  loader: () => import('./views/Warehouse/StorageManagement/InboundView'),
  loading: Loading,
});

const IssuedDoc = Loadable({
  loader: () => import('./views/Warehouse/IssuedDoc'),
  loading: Loading,
});

const IssuedManage = Loadable({
  loader: () => import('./views/Warehouse/IssuedDoc/IssuedManage'),
  loading: Loading,
});

const PickConso = Loadable({
  loader: () => import('./views/Warehouse/Picking/PickAndConso'),
  loading: Loading,
});

const LoadingManage = Loadable({
  loader: () => import('./views/Warehouse/Loading'),
  loading: Loading,
});

const LoadingDocument = Loadable({
  loader: () => import('./views/Warehouse/Loading/LoadingDocument'),
  loading: Loading,
});

const LoadingChecklist = Loadable({
  loader: () => import('./views/Warehouse/Loading/LoadingCheckList'),
  loading: Loading,
});

const ComfrimBox = Loadable({
  loader: () => import('./views/Warehouse/ComfirmBox'),
  loading: Loading,
});
const StockCorrection = Loadable({
  loader: () => import('./views/Warehouse/StockCorrection'),
  loading: Loading,
});

const Stock = Loadable({
  loader: () => import('./views/Warehouse/Stock'),
  loading: Loading,
});

const Stockview = Loadable({
  loader: () => import('./views/Warehouse/Stockview'),
  loading: Loading,
});
 const StockCard = Loadable({
     loader: () => import('./views/Warehouse/StockCardReport/StockCardReport'),
     loading: Loading,
 });

const CurrentInv = Loadable({
  loader: () => import('./views/Warehouse/CurrentReport/CurrentReport'),
  loading: Loading,
});

const StorageDetail = Loadable({
  loader: () => import('./views/Warehouse/StorageManagement/InboundView/InboundDetail'),
  loading: Loading,
});

// const APIKey = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/APIKey'),
//   loading: Loading,
// });

// const ClientSecret = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/ClientSecret'),
//   loading: Loading,
// });

// const Config = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/Config'),
//   loading: Loading,
// });

// const DocumentType = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/DocumentType'),
//   loading: Loading,
// });

// const Feature = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/Feature'),
//   loading: Loading,
// });

// const JobSchedule = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/JobSchedule'),
//   loading: Loading,
// });

// const Role = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/Role'),
//   loading: Loading,
// });

// const Transport = Loadable({
//   loader: () => import('./views/Warehouse/MasterData/Transport'),
//   loading: Loading,
// });

const ReceiveManage = Loadable({
  loader: () => import('./views/Warehouse/StorageManagement/InboundView/ReceiveManage/ReceiveManage'),
  loading: Loading,
});

const TaskList = Loadable({
  loader: () => import('./views/Warehouse/TaskList/TaskList'),
  loading: Loading,
});
const QueueView = Loadable({
  loader: () => import('./views/Warehouse/Queue/QueueView'),
  loading: Loading,
});

const CreateQueue = Loadable({
  loader: () => import('./views/Warehouse/Queue/CreateQueue'),
  loading: Loading,
});

const ChangePass = Loadable({
  loader: () => import('./views/Pages/ChangePass/ChangePass'),
  loading: Loading,
});

const Profile = Loadable({
  loader: () => import('./views/Pages/Profile/Profile'),
  loading: Loading,
});

const Return = Loadable({
  loader: () => import('./views/Warehouse/Return/Return'),
  loading: Loading,
});

const Audit = Loadable({
  loader: () => import('./views/Warehouse/Audit/Audit'),
  loading: Loading,
});

const AuditQueue = Loadable({
  loader: () => import('./views/Warehouse/Audit/AuditQueue'),
  loading: Loading,
});

const AuditDoc = Loadable({
  loader: () => import('./views/Warehouse/Audit/AuditDoc'),
  loading: Loading,
});

const AuditCreate = Loadable({
  loader: () => import('./views/Warehouse/Audit/AuditCreateDoc/AuditCreateDoc'),
  loading: Loading,
});



// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: Dashboard },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  // { path: '/mst/sku/manage', exact: true, name: 'Setting / SKU Master', component: Products },
  // { path: '/mst/catagory/manage', exact: true, name: 'Setting / SKU Collection', component: SKUType },
  // { path: '/mst/pack/manage', exact: true, name: 'Setting / SKU Unit', component: Pack },
  // { path: '/mst/packtype/manage', exact: true, name: 'Setting / Pack Type', component: PackType },
  // { path: '/mst/sku/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  // { path: '/mst/customer/manage', exact: true, name: 'Setting / Customer', component: Customer },
  // { path: '/mst/supplier/manage', exact: true, name: 'Setting / Supplier', component: Supplier },
  // { path: '/mst/area/manage', exact: true, name: 'Setting / Area', component: Area },
  // { path: '/mst/areatype/manage', exact: true, name: 'Setting / Area Type', component: AreaType },
  // { path: '/mst/location/manage', exact: true, name: 'Setting / Location', component: AreaLocation },
  // { path: '/mst/arealocation/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  // { path: '/mst/arearoute/manage', exact: true, name: 'Setting / Area Route', component: AreaRoute },
  // { path: '/mst/pallet/manage', exact: true, name: 'Setting / Pallet Master', component: Base },
  // { path: '/mst/pallettype/manage', exact: true, name: 'Setting / Pallet Type', component: BaseType },
  // { path: '/mst/pallet/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  // { path: '/mst/branch/manage', exact: true, name: 'Setting / Branch', component: Branch },
  // { path: '/mst/user/manage', exact: true, name: 'Setting / User Account', component: User },
  // { path: '/mst/warehouse/manage', exact: true, name: 'Setting / Warehouse', component: Warehouse },
  // { path: '/mst/permission/manage', exact: true, name: 'Setting / Permission', component: Permission },
  // { path: '/mst/apiservicegroup/manage', exact: true, name: 'Setting / API Service Group', component: APIServiceGroup },
  // { path: '/mst/apiservice/manage', exact: true, name: 'Setting / API Service', component: APIService },
  // { path: '/mst/objectsize/manage', exact: true, name: 'Setting / Weight Validate', component: ObjectSize },
  // { path: '/mst/jobschedulemodule/manage', exact: true, name: 'Setting / Job Schedule Module', component: JobScheduleModule },
  // { path: '/mst/unittype/manage', exact: true, name: 'Setting / Unit Type', component: UnitType },
  // { path: '/mst/webcontrol/manage', exact: true, name: 'Setting / Web Control', component: WebControl },
  // { path: '/mst/webpage/manage', exact: true, name: 'Setting / Web Page', component: WebPage },
  // { path: '/mst/webpagegroup/manage', exact: true, name: 'Setting / Web Page Group', component: WebPageGroup }, 
  { path: '/wm/sto/revmap', exact: true, name: 'Receive Mapping', component: InboundManagement },
  { path: '/wm/sto/transfer', exact: true, name: 'Transfer', component: InboundManagement },
  { path: '/doc/gr/list', exact: true, name: 'Receive / Search Receive', component: InboundView },
  { path: '/doc/gr/manage', exact: true, name: 'Receive Document Manage', component: ReceiveManage },
  { path: '/doc/gi/list', exact: true, name: 'Issue / Search Issue', component: IssuedDoc },
  { path: '/doc/gi/manage', exact: true, name: 'Issue / Create Issue', component: IssuedManage },
  { path: '/wm/sto/picking', exact: true, name: 'Issue / Picking', component: PickConso },
  { path: '/wm/sto/return', exact: true, name: 'Return', component: Return },
  { path: '/doc/ld/manage', exact: true, name: 'Loading Manage', component: LoadingDocument },
  { path: '/doc/ld/list', exact: true, name: 'Loading Document', component: LoadingManage },
  { path: '/sys/storage/list', exact: true, name: 'Report / Storage Object', component: Storage },
  { path: '/sys/storage/history', exact: true, name: 'History', component: History },
  { path: '/mst/base/rebox', exact: true, name: 'Return Box', component: ComfrimBox },
  { path: '/wm/sto/correction', exact: true, name: 'Stock Correction', component: StockCorrection },
  { path: '/wm/sto/loading', exact: true, name: 'Loading Checklist', component: LoadingChecklist },
  { path: '/doc/stc/manage', exact: true, name: 'Stock Correction Manage ', component: Stock },
  { path: '/doc/stc/list', exact: true, name: 'Stock Correction Document', component: Stockview },
    { path: '/sys/sto/stccard', exact: true, name: 'Report / Stock Card', component: StockCard },
  //{ path: '/doc/gr/manage', exact: true, name: 'Goods Receive Manage', component: GoodsReceiveManage },
  { path: '/sys/sto/curinv', exact: true, name: 'Report / Current Inventory', component: CurrentInv },
  { path: '/doc/gr/view', exact: true, name: 'Receive Document', component: StorageDetail },
  // { path: '/mst/APIKey/manage', exact: true, name: 'Setting / APIKey', component: APIKey },
  // { path: '/mst/cs/manage', exact: true, name: 'Setting / Client Secret', component: ClientSecret },
  // { path: '/mst/conf/manage', exact: true, name: 'Setting / Config', component: Config },
  // { path: '/mst/doctype/manage', exact: true, name: 'Setting / Document Type', component: DocumentType },
  // { path: '/mst/ft/manage', exact: true, name: 'Setting / Feature', component: Feature },
  // { path: '/mst/jobs/manage', exact: true, name: 'Setting / Job Schedule', component: JobSchedule },
  // { path: '/mst/role/manage', exact: true, name: 'Setting / Role', component: Role },
  // { path: '/mst/tp/manage', exact: true, name: 'Setting / Transport', component: Transport },
  { path: '/wm/issue/manage', exact: true, name: 'Issue / Create Queue', component: CreateQueue },
  //{ path: '/wm/sto/loading', exact: true, name: 'Loading', component: Loading },
  { path: '/sys/sto/progress', exact: true, name: 'Dashboard / Picking Progress', component: TaskList },
  { path: '/sys/gr/progress?IOType=IN', exact: true, name: 'Receiving Progress', component: QueueView },
  { path: '/sys/gi/progress?IOType=OUT', exact: true, name: 'Issuing Progress', component: QueueView },
  { path: '/changepassword', exact: true, name: 'Change Password', component: ChangePass },
  { path: '/profile', exact: true, name: 'Profile', component: Profile },
  { path: '/sys/ad/audit', exact: true, name: 'Audit', component: Audit },
  { path: '/sys/ad/queueaudit', exact: true, name: 'Audit Queue Process', component: AuditQueue },
  { path: '/sys/ad/search', exact: true, name: 'Search Audit', component: AuditDoc },
  { path: '/sys/ad/create', exact: true, name: 'Create Audit Document', component: AuditCreate },
];

export default routes;

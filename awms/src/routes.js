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
  loader: () => import('./views/Warehouse/Storage'),
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
  loader: () => import('./views/Warehouse/StockCard'),
  loading: Loading,
});

const CurrentInv = Loadable({
  loader: () => import('./views/Warehouse/CurrentInv'),
  loading: Loading,
});

const StorageDetail = Loadable({
  loader: () => import('./views/Warehouse/StorageManagement/InboundView/InboundDetail'),
  loading: Loading,
});

const APIKey = Loadable({
  loader: () => import('./views/Warehouse/MasterData/APIKey'),
  loading: Loading,
});

const ClientSecret = Loadable({
  loader: () => import('./views/Warehouse/MasterData/ClientSecret'),
  loading: Loading,
});

const Config = Loadable({
  loader: () => import('./views/Warehouse/MasterData/Config'),
  loading: Loading,
});

const DocumentType = Loadable({
  loader: () => import('./views/Warehouse/MasterData/DocumentType'),
  loading: Loading,
});

const Feature = Loadable({
  loader: () => import('./views/Warehouse/MasterData/Feature'),
  loading: Loading,
});

const JobSchedule = Loadable({
  loader: () => import('./views/Warehouse/MasterData/JobSchedule'),
  loading: Loading,
});

const Role = Loadable({
  loader: () => import('./views/Warehouse/MasterData/Role'),
  loading: Loading,
});

const Transport = Loadable({
  loader: () => import('./views/Warehouse/MasterData/Transport'),
  loading: Loading,
});

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


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: Dashboard },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/mst/sku/manage', exact: true, name: 'SKU', component: Products },
  { path: '/mst/pack/manage', exact: true, name: 'Pack', component: Pack },
  { path: '/mst/packtype/manage', exact: true, name: 'Pack Type', component: PackType },
  { path: '/mst/sku/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  { path: '/mst/customer/manage', exact: true, name: 'Customer', component: Customer },
  { path: '/mst/supplier/manage', exact: true, name: 'Supplier', component: Supplier },
  { path: '/mst/area/manage', exact: true, name: 'Area', component: Area },
  { path: '/mst/areatype/manage', exact: true, name: 'Area Type', component: AreaType },
  { path: '/mst/arealocation/manage', exact: true, name: 'Area Location', component: AreaLocation },
  { path: '/mst/arealocation/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  { path: '/mst/arearoute/manage', exact: true, name: 'Area Route', component: AreaRoute },
  { path: '/mst/base/manage', exact: true, name: 'Base', component: Base },
  { path: '/mst/basetype/manage', exact: true, name: 'Base Type', component: BaseType },
  { path: '/mst/base/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  { path: '/mst/branch/manage', exact: true, name: 'Branch', component: Branch },
  { path: '/mst/user/manage', exact: true, name: 'User', component: User },
  { path: '/mst/warehouse/manage', exact: true, name: 'Warehouse', component: Warehouse },
  { path: '/mst/permission/manage', exact: true, name: 'Permission', component: Permission },
  { path: '/mst/apiservicegroup/manage', exact: true, name: 'API Service Group', component: APIServiceGroup },
  { path: '/mst/apiservice/manage', exact: true, name: 'API Service', component: APIService },
  { path: '/mst/skutype/manage', exact: true, name: 'SKU Type', component: SKUType },
  { path: '/mst/objectsize/manage', exact: true, name: 'Object Size', component: ObjectSize },
  { path: '/mst/jobschedulemodule/manage', exact: true, name: 'Job Schedule Module', component: JobScheduleModule },
  { path: '/mst/unittype/manage', exact: true, name: 'Unit Type', component: UnitType },
  { path: '/mst/webcontrol/manage', exact: true, name: 'Web Page', component: WebControl },
  { path: '/mst/webpage/manage', exact: true, name: 'Web Page', component: WebPage },
  { path: '/mst/webpagegroup/manage', exact: true, name: 'Web Page Group', component: WebPageGroup },
  { path: '/wm/sto/revmap', exact: true, name: 'Receive Mapping', component: InboundManagement },
  { path: '/wm/sto/transfer', exact: true, name: 'Transfer', component: InboundManagement },
  { path: '/doc/gr/list', exact: true, name: 'Goods Receive Document', component: InboundView },
  { path: '/doc/gr/manage', exact: true, name: 'Goods Receive Manage', component: ReceiveManage },
  { path: '/doc/gi/list', exact: true, name: 'Goods Issue Document', component: IssuedDoc },
  { path: '/doc/gi/manage', exact: true, name: 'Goods Issue Manage', component: IssuedManage },
  { path: '/wm/sto/picking', exact: true, name: 'Picking', component: PickConso },
  { path: '/doc/ld/manage', exact: true, name: 'Loading Manage', component: LoadingDocument },
  { path: '/doc/ld/list', exact: true, name: 'Loading Document', component: LoadingManage },
  { path: '/sys/storage/list', exact: true, name: 'Storage', component: Storage },
  { path: '/sys/storage/history', exact: true, name: 'History', component: History },
  { path: '/mst/base/rebox', exact: true, name: 'Return Box', component: ComfrimBox },
  { path: '/wm/sto/correction', exact: true, name: 'Stock Correction', component: StockCorrection },
  { path: '/wm/sto/loading', exact: true, name: 'Loading Checklist', component: LoadingChecklist },
  { path: '/doc/stc/manage', exact: true, name: 'Stock Correction Manage ', component: Stock },
  { path: '/doc/stc/list', exact: true, name: 'Stock Correction Document', component: Stockview },
  { path: '/sys/sto/stccard', exact: true, name: 'Stock Card', component: StockCard },
  //{ path: '/doc/gr/manage', exact: true, name: 'Goods Receive Manage', component: GoodsReceiveManage },
  { path: '/sys/sto/curinv', exact: true, name: 'CurrentInv', component: CurrentInv},
  { path: '/doc/gr/view', exact: true, name: 'StorageDetail', component: StorageDetail},
  { path: '/mst/APIKey/manage', exact: true, name: 'APIKey', component: APIKey},
  { path: '/mst/cs/manage', exact: true, name: 'ClientSecret', component: ClientSecret},
  { path: '/mst/conf/manage', exact: true, name: 'Config', component: Config},
  { path: '/mst/doctype/manage', exact: true, name: 'DocumentType', component:DocumentType},
  { path: '/mst/ft/manage', exact: true, name: 'Feature', component:Feature},
  { path: '/mst/jobs/manage', exact: true, name: 'JobSchedule', component:JobSchedule},
  { path: '/mst/role/manage', exact: true, name: 'Role', component:Role},
  { path: '/mst/tp/manage', exact: true, name: 'Transport', component:Transport},
  //{ path: '/wm/sto/loading', exact: true, name: 'Loading', component: Loading },
  { path: '/wm/sto/tasklist', exact: true, name: 'Dashboard Task List', component: TaskList },

  { path: '/wm/queue/manage', exact: true, name: 'QueueView', component:QueueView},
];

export default routes;

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

const AreaLocation = Loadable({
  loader: () => import('./views/Warehouse/MasterData/AreaLocation'),
  loading: Loading,
});

const Base = Loadable({
  loader: () => import('./views/Warehouse/MasterData/Base'),
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

const SKUType = Loadable({
  loader: () => import('./views/Warehouse/MasterData/SKUType'),
  loading: Loading,
});

const ObjectSize = Loadable({
  loader: () => import('./views/Warehouse/MasterData/ObjectSize'),
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

const BaseMasterType = Loadable({
  loader: () => import('./views/Warehouse/MasterData/BaseMasterType'),
  loading: Loading,
});

const Transport = Loadable({
  loader: () => import('./views/Warehouse/MasterData/Transport'),
  loading: Loading,
});


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: Dashboard },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/mst/sku/manage', exact: true, name: 'Product', component: Products },
  { path: '/mst/sku/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  { path: '/mst/customer/manage', exact: true, name: 'Customer', component: Customer },
  { path: '/mst/supplier/manage', exact: true, name: 'Supplier', component: Supplier },
  { path: '/mst/area/manage', exact: true, name: 'Area', component: Area },
  { path: '/mst/arealocation/manage', exact: true, name: 'Area Location', component: AreaLocation },
  { path: '/mst/arealocation/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  { path: '/mst/base/manage', exact: true, name: 'Base', component: Base },
  { path: '/mst/base/manage/barcode', exact: true, name: 'Barcode', component: Barcode },
  { path: '/mst/branch/manage', exact: true, name: 'Branch', component: Branch },
  { path: '/mst/user/manage', exact: true, name: 'User', component: User },
  { path: '/mst/warehouse/manage', exact: true, name: 'Warehouse', component: Warehouse },
  { path: '/mst/skutype/manage', exact: true, name: 'SKU Type', component: SKUType },
  { path: '/mst/objectsize/manage', exact: true, name: 'Object Size', component: ObjectSize },
  { path: '/wm/sto/revmap', exact: true, name: 'Receive Mapping', component: InboundManagement },
  { path: '/wm/sto/transfer', exact: true, name: 'Transfer', component: InboundManagement },
  { path: '/doc/gr/list', exact: true, name: 'Goods Receive Document', component: InboundView },
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
  { path: '/mst/btype/manage', exact: true, name: 'BaseMasterType', component:BaseMasterType},
  { path: '/mst/tp/manage', exact: true, name: 'Transport', component:Transport},
  //{ path: '/wm/sto/loading', exact: true, name: 'Loading', component: Loading },
];

export default routes;

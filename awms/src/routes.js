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

const Historyy = Loadable({
  loader: () => import('./views/Warehouse/Storage/History'),
  loading: Loading,
});
const ComfrimBox = Loadable({
  loader: () => import('./views/ComfirmBox'),
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
  { path: '/mst/skutype/manage', exact: true, name: 'skutype', component: SKUType },
  { path: '/mst/storage/manage', exact: true, name: 'Storage', component: Storage },
  { path: '/wm/sto/revmap', exact: true, name: 'Receive Mapping', component: InboundManagement },
  { path: '/wm/sto/transfer', exact: true, name: 'Transfer', component: InboundManagement },
  { path: '/doc/gr/list', exact: true, name: 'Goods Receive Document', component: InboundView },
  { path: '/doc/gi/list', exact: true, name: 'Goods Issue Document', component: IssuedDoc },
  { path: '/doc/gi/manage', exact: true, name: 'Goods Issue Manage', component: IssuedManage },
  { path: '/wm/sto/picking', exact: true, name: 'Picking', component: PickConso },
  { path: '/doc/ld/manage', exact: true, name: 'Loading Manage', component: LoadingDocument },
  { path: '/doc/ld/list', exact: true, name: 'Loading Document', component: LoadingManage },
  { path: '/wms/history', exact: true, name: 'History', component: Historyy },
  { path: '/wms/loading/manage/issuedmanage', exact: true, name: 'IssuedManage', component: IssuedManage },
  { path: '/mst/warehouse/Stock/manage', exact: true, name: 'Stock', component: Stock },
  { path: '/mst/warehouse/Stockview/manage', exact: true, name: 'Stockview', component: Stockview },
  { path: '/mst/base/rebox', exact: true, name: 'Return Box', component: ComfrimBox },
  { path: '/wm/sto/correction', exact: true, name: 'Stock Correction', component: StockCorrection },
  //{ path: '/doc/gr/manage', exact: true, name: 'Goods Receive Manage', component: GoodsReceiveManage },
  //{ path: '/doc/stc/list', exact: true, name: 'Stock Correction Document', component: StockCorrectionDocument },
  //{ path: '/wm/sto/loading', exact: true, name: 'Loading', component: Loading },
];

export default routes;

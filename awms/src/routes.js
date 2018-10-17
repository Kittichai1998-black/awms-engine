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
  { path: '/mst/storage/manage', exact: true, name: 'Storage', component: Storage },
  { path: '/wms/storageObject/register', exact: true, name: 'InboundManagement', component: InboundManagement },
  { path: '/wms/storageObject/transfer', exact: true, name: 'InboundManagement', component: InboundManagement },
  { path: '/wms/storageObject/manage', exact: true, name: 'InboundView', component: InboundView },
  { path: '/wms/issueddoc/manage', exact: true, name: 'IssuedDoc', component: IssuedDoc },
  { path: '/wms/issueddoc/manage/issuedmanage', exact: true, name: 'IssuedManage', component: IssuedManage },
  { path: '/wms/picking/manage', exact: true, name: 'PickConso', component: PickConso },
  { path: '/wms/loading/manage', exact: true, name: 'Loading', component: LoadingManage },
  { path: '/wms/loading/manage/loadingdocument', exact: true, name: 'Loading Document', component: LoadingDocument },
  { path: '/wms/loading/manage/loadingchecklist', exact: true, name: 'Loading Checklist', component: LoadingChecklist },
  { path: '/wms/history', exact: true, name: 'History', component: Historyy },
  { path: '/wms/loading/manage/issuedmanage', exact: true, name: 'IssuedManage', component: IssuedManage },
  { path: '/mst/warehouse/Stock/manage', exact: true, name: 'Stock', component: Stock },
  { path: '/mst/warehouse/Stockview/manage', exact: true, name: 'Stockview', component: Stockview },
];

export default routes;

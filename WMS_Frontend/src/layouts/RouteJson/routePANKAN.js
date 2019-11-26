import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}
const searchGR = Loadable({
  loader: () => import("../../views/page/Pankan/Receive/searchGR"),
  loading: Loading
});

const DetailGR = Loadable({
  loader: () => import("../../views/page/Pankan/Receive/DetailDocumentGR"),
  loading: Loading
});

const CreateGI = Loadable({
  loader: () => import("../../views/page/Pankan/Issue/CreateDocumentGI"),
  loading: Loading
});
const MappingReceivePallet = Loadable({
  loader: () => import("../../views/page/Pankan/Receive/MappingReceivePallet"),
  loading: Loading
});

const DocumentSearchGI = Loadable({
  loader: () => import("../../views/page/Pankan/Issue/searchGI"),
  loading: Loading
});

const DocumentViewGI = Loadable({
  loader: () => import("../../views/page/Pankan/Issue/DetailDocumentGI"),
  loading: Loading
});

const DocumentSearchLD = Loadable({
    loader: () => import("../../views/page/Pankan/Loading/searchLD"),
    loading: Loading
});

const CreateLD = Loadable({
  loader: () => import("../../views/page/Pankan/Loading/CreateDocumentLD"),
  loading: Loading
});

const Tranfer = Loadable({
  loader: () => import("../../views/page/Pankan/Receive/Tranfer"),
  loading: Loading
});

const ConsolePankan = Loadable({
  loader: () => import("../../views/page/Pankan/Issue/ConsolePankan"),
  loading: Loading
});

const LoadingEx = Loadable({
  loader: () => import("../../views/page/Pankan/Loading/Loading"),
  loading: Loading
});

const LoadingDetail = Loadable({
    loader: () => import("../../views/page/Pankan/Loading/DetailDocumentLD"),
    loading: Loading
});

const SettingSKUMaster = Loadable({
    loader: () => import("../../views/page/Pankan/Master/SKUMaster"),
    loading: Loading
});

const SettingSupplier = Loadable({
    loader: () => import("../../views/page/Pankan/Master/Supplier"),
    loading: Loading
});

const SettingCustomer = Loadable({
    loader: () => import("../../views/page/Pankan/Master/Customer"),
    loading: Loading
});

const SettingArea = Loadable({
    loader: () => import("../../views/page/Pankan/Master/AreaMaster"),
    loading: Loading
});

const SettingArealocation = Loadable({
    loader: () => import("../../views/page/Pankan/Master/AreaLocationMaster"),
    loading: Loading
});

const SettingSkuType = Loadable({
    loader: () => import("../../views/page/Pankan/Master/SKUMasterType"),
    loading: Loading
});
const SettingBase = Loadable({
    loader: () => import("../../views/page/Pankan/Master/BaseMaster"),
    loading: Loading
});
const SettingUser = Loadable({
    loader: () => import("../../views/page/Pankan/Master/User"),
    loading: Loading
});
const SettingBranch = Loadable({
    loader: () => import("../../views/page/Pankan/Master/BranchMaster"),
    loading: Loading
});
const routes = [
    { path: "/receive/search", name: "base5", compoment: searchGR, exact: true },
  { path: "/receive/detail", name: "base5", compoment: DetailGR, exact: true },
  { path: "/issue/create", name: "base5", compoment: CreateGI, exact: true },
  {
    path: "/issue/search",
    name: "base5",
    compoment: DocumentSearchGI,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "base5",
    compoment: DocumentViewGI,
    exact: true
  },
  {
    path: "/issue/console",
    name: "base5",
    compoment: ConsolePankan,
    exact: true
  },
  {
    path: "/receive/scanreceive",
    name: "Mapping Receive Pallet",
    compoment: MappingReceivePallet,
    exact: true
  },
  {
    path: "/receive/tranfer",
    name: "Tranfer",
    compoment: Tranfer,
    exact: true
    },
    {
        path: "/loading/search",
        name: "base5",
        compoment: DocumentSearchLD,
        exact: true
    },
  { path: "/loading/create", name: "base5", compoment: CreateLD, exact: true },
    { path: "/loading/loading", name: "base5", compoment: LoadingEx, exact: true },
    { path: "/loading/detail", name: "base5", compoment: LoadingDetail, exact: true },
    { path: "/setting/sku", name: "base5", compoment: SettingSKUMaster, exact: true },
    { path: "/setting/supplier", name: "base5", compoment: SettingSupplier, exact: true },
    { path: "/setting/customer", name: "base5", compoment: SettingCustomer, exact: true },
    { path: "/setting/area", name: "base5", compoment: SettingArea, exact: true },
    { path: "/setting/arealocation", name: "base5", compoment: SettingArealocation, exact: true },
    { path: "/setting/skutype", name: "base5", compoment: SettingSkuType, exact: true },
    { path: "/setting/base", name: "base5", compoment: SettingBase, exact: true },
    { path: "/setting/user", name: "base5", compoment: SettingUser, exact: true },
    { path: "/setting/branch", name: "base5", compoment: SettingBranch, exact: true },
];

export default routes;

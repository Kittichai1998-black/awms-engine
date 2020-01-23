import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const DocumentSearchGR = Loadable({
  loader: () => import("../../views/page/TMC/Receive/DocumentSearchGR"),
  loading: Loading
});
const DocumentViewGR = Loadable({
  loader: () => import("../../views/page/TMC/Receive/DocumentViewGR"),
  loading: Loading
});
const DocumentViewGI = Loadable({
  loader: () => import("../../views/page/TMC/Issues/DocumentViewGI"),
  loading: Loading
});
const CreateDocGRRaw = Loadable({
  loader: () => import("../../views/page/TMC/Receive/CreateDocGRRaw"),
  loading: Loading
});
const CreateDocGRFG = Loadable({
  loader: () => import("../../views/page/TMC/Receive/CreateDocGRFG"),
  loading: Loading
});
const DocumentSearchGI = Loadable({
  loader: () => import("../../views/page/TMC/Issues/DocumentSearchGI"),
  loading: Loading
});
const CreateDocGI = Loadable({
  loader: () => import("../../views/page/TMC/Issues/CreateDocGI"),
  loading: Loading
});
const CreateDocPI = Loadable({
  loader: () => import("../../views/page/TMC/Audit/CreateDocPI"),
  loading: Loading
});
const DocumentSearchPI = Loadable({
  loader: () => import("../../views/page/TMC/Audit/DocumentSearchPI"),
  loading: Loading
});
const DocumentViewPI = Loadable({
  loader: () => import("../../views/page/TMC/Audit/DocumentViewPI"),
  loading: Loading
});

const routes = [
  {
    path: "/receive/search",
    name: "Search GR",
    compoment: DocumentSearchGR,
    exact: true
  },
  {
    path: "/receive/detail",
    name: "Search GR",
    compoment: DocumentViewGR,
    exact: true
  },
  {
    path: "/receive/createRaw",
    name: "Create GR",
    compoment: CreateDocGRRaw,
    exact: true
  },
  {
    path: "/receive/create",
    name: "Create GR",
    compoment: CreateDocGRFG,
    exact: true
  },
  {
    path: "/issue/detail",
    name: "GI View",
    compoment: DocumentViewGI,
    exact: true
  },
  {
    path: "/issue/search",
    name: "Search GI",
    compoment: DocumentSearchGI,
    exact: true
  },
  {
    path: "/issue/create",
    name: "base5",
    compoment: CreateDocGI,
    exact: true
  },
  {
    path: "/counting/search",
    name: "base5",
    compoment: DocumentSearchPI,
    exact: true
  },
  {
    path: "/counting/detail",
    name: "base5",
    compoment: DocumentViewPI,
    exact: true
  },
  {
    path: "/counting/createPhysical",
    name: "base5",
    compoment: CreateDocPI,
    exact: true
  }
];

export default routes;

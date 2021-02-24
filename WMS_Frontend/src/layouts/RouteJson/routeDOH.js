import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}
const HandheldReceive = Loadable({
  loader: () => import("../../views/page/DOH/Receive/HandheldReceive"),
  loading: Loading
});
const GR_Detail = Loadable({
  loader: () => import("../../views/page/DOH/GR/GR_Detail"),
  loading: Loading
});
const PA_Detail = Loadable({
  loader: () => import("../../views/page/DOH/PA/PA_Detail"),
  loading: Loading
});
const routes = [
  { path: "/receive/handheldreceive", name: "Handheld Receive", compoment: HandheldReceive, exact: true },
  { path: "/receive/detail", name: "GR View", compoment: GR_Detail, exact: true, child: true },
  { path: "/receive/putawaydetail", name: "PA View", compoment: PA_Detail, exact: true, child: true },
];

export default routes;
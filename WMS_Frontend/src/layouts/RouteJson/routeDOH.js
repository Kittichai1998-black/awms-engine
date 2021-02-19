import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}
const HandheldReceive = Loadable({
  loader: () => import("../../views/page/DOH/Receive/HandheldReceive"),
  loading: Loading
});

const routes = [
  { path: "/receive/handheldreceive", name: "Handheld Receive", compoment: HandheldReceive, exact: true },
];

export default routes;
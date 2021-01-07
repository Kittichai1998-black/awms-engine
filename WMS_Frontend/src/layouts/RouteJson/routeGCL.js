import Loadable from "react-loadable";
import React from "react";

function Loading() {
  return <div>Loading...</div>;
}

const Monitor_Location = Loadable({
  loader: () => import("../../views/page/GCL/Monitor/Monitor_Location"),
  loading: Loading
});


const routes = [

  { path: "/monitor/location", name: "Monitor Location", compoment: Monitor_Location, exact: true,child:true },

 
];

export default routes;

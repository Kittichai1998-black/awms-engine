import Loadable from "react-loadable";
import React from "react";

function Loading() {
    return <div>Loading...</div>;
}

const Scanpallet = Loadable({
    loader: () => import("../../views/page/BOTHY/ScanPallet"),
    loading: Loading
});

const routes = [
    { path: "/scan/recive", name: "Scanpallet", compoment: Scanpallet, exact: true }
    ]

export default routes;
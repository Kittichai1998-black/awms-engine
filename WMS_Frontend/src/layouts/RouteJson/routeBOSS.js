import Loadable from "react-loadable";
import React from "react";

function Loading() {
    return <div>Loading...</div>;
}

const PK_ManageQueue = Loadable({
    loader: () => import("../../views/page/BOSS/PK/PK_ManageQueue"),
    loading: Loading
});
const routes = [
    { path: "/issue/managequeue", name: "PK Manage Queue", compoment: PK_ManageQueue, exact: true },
]

export default routes;
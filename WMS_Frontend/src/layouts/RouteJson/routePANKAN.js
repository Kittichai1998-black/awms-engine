import Loadable from "react-loadable";
import React from "react";

function Loading() {
    return <div>Loading...</div>;
}
const searchGR = Loadable({
    loader: () => import("../../views/page/Pankan/Receive/searchGR"),
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

const CreateLD = Loadable({
    loader: () => import("../../views/page/Pankan/Loading/CreateDocumentLD"),
    loading: Loading
});

const routes = [
    { path: "/receive/search", name: "base5", compoment: searchGR, exact: true },
    { path: "/issue/create", name: "base5", compoment: CreateGI, exact: true },
    { path: "/issue/search", name: "base5", compoment: DocumentSearchGI, exact: true },
    { path: "/issue/detail", name: "base5", compoment: DocumentViewGI, exact: true },
    { path: "/receive/scanreceive", name: "Mapping Receive Pallet", compoment: MappingReceivePallet, exact: true },
    { path: "/loading/create", name: "base5", compoment: CreateLD, exact: true },

];

export default routes;

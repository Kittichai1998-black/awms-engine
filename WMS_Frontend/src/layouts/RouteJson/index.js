import DefaultRoute from "./routeDefault";
import ENGINE from "./routeEngine";
import GCL from "./routeGCL";
import SCN from "./routeSCN";
import DOH from "./routeDOH";

var PROJ = null;

if (window.project === "GCL") {
    PROJ = GCL;
} else if (window.project === "SCN") {
    PROJ = SCN;
} else if (window.project === "DOH") {
    PROJ = DOH;
} else {
    PROJ = ENGINE;
}

export { PROJ, DefaultRoute };

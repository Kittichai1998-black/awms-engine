import DefaultRoute from "./routeDefault";
import ENGINE from "./routeEngine";
import GCL from "./routeGCL";

var PROJ = null;

if (window.project === "GCL") {
    PROJ = GCL;
} else {
    PROJ = ENGINE;
}

export { PROJ, DefaultRoute };

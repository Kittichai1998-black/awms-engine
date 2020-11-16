import DefaultRoute from "./routeDefault";
import BOT from "./routeBOT";
import ENGINE from "./routeEngine";
// import PANKAN from "./routePANKAN";

var PROJ = null;

if (window.project === "BOT") {
    PROJ = BOT;
} else {
    PROJ = ENGINE;
}

export { PROJ, DefaultRoute };

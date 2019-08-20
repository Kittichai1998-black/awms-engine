import DefaultRoute from "./routeDefault";
import MRK from "./routeMRK";
import TAP from "./routeTAP";
import STA from "./routeSTA";
import AAI from "./routeAAI";
import ENGINE from "./routeEngine";
import PANKAN from './routePANKAN'

var PROJ = null;

if (window.project === "STA") {
  PROJ = STA;
} else if (window.project === "TAP") {
  PROJ = TAP;
} else if (window.project === "MRK") {
  PROJ = MRK;
} else if (window.project === "AAI") {
    PROJ = AAI;
} else if (window.project === 'PANKAN') {
    PROJ = PANKAN;
} else {
  PROJ = ENGINE;
}

export { PROJ, DefaultRoute };

import DefaultRoute from "./routeDefault";
// import MRK from "./routeMRK";
// import TAP from "./routeTAP";
// import STA from "./routeSTA";
// import TMC from "./routeTMC";
// import AAI from "./routeAAI";
// import STGT from "./routeSTGT";
import AERP from "./routeAERP";
import ENGINE from "./routeEngine";
// import PANKAN from "./routePANKAN";

var PROJ = null;
if (window.project === "STA") {
  //PROJ = STA;
} else if (window.project === "TAP") {
  //PROJ = TAP;
} else if (window.project === "MRK") {
  //PROJ = MRK;
} else if (window.project === "AAI") {
  //PROJ = AAI;
} else if (window.project === "PANKAN") {
  //PROJ = PANKAN;
} else if (window.project === "STGT") {
  //PROJ = STGT;
} else if (window.project === "TMC") {
  //PROJ = TMC;
} else if (window.project === "AERP") {
  PROJ = AERP;
} else {
  PROJ = ENGINE;
}

export { PROJ, DefaultRoute };

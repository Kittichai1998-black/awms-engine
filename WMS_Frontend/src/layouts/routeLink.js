import _ from "lodash";
import { DefaultRoute, PROJ } from "./RouteJson";

let newRoutes = _.uniqBy([ ...PROJ, ...DefaultRoute], "path");
// console.log(newRoutes)
export default newRoutes;

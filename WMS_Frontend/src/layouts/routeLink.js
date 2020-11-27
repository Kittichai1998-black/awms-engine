import _ from "lodash";
import { DefaultRoute, PROJ } from "./RouteJson";
import route from './route';

let newRoutes = _.uniqBy([ ...PROJ, ...DefaultRoute], "path");

const permissionLink = route(localStorage.getItem('MenuItems')).reduce((oldV, newV) => {
    let getLink = newV.child.map(v => {return {"path":v.to}});
    return oldV.concat(getLink)
}, []);
let getBaseRoute = newRoutes.find(y => y.name === "base")
permissionLink.push(getBaseRoute)
permissionLink.forEach(x=> {
    let chkRoute = newRoutes.find(y => y.path === x.path)
    if(chkRoute !== undefined){
        x.name = chkRoute.name;
        x.compoment = chkRoute.compoment;
        x.exact = chkRoute.exact;
    }
});

export default permissionLink;

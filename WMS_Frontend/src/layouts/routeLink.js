import _ from "lodash";
import { DefaultRoute, PROJ } from "./RouteJson";
import route from './route';

const getUrl = (item) => {
    let newRoutes = _.uniqBy([ ...PROJ, ...DefaultRoute], "path");
    let permissionLink = route(item).reduce((oldV, newV) => {
        let getLink = newV.child.map(v => {return {"path":v.to}});
        return oldV.concat(getLink)
    }, []);
    let getBaseRoute = newRoutes.find(y => y.name === "base")
    let getLink = newRoutes.filter(y => y.child)
    permissionLink.push(getBaseRoute)
    permissionLink = permissionLink.concat(getLink);
    permissionLink.forEach(x=> {
        let chkRoute = newRoutes.find(y => y.path === x.path)
        if(chkRoute !== undefined){
            x.name = chkRoute.name;
            x.compoment = chkRoute.compoment;
            x.exact = chkRoute.exact;
        }
    });
    return permissionLink;
}

export default getUrl;

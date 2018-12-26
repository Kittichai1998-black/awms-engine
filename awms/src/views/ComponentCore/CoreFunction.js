import Axios from 'axios';
import moment from 'moment';
import * as Status from '../Warehouse/Status';

class apicall{
    get(url){
        return Axios.get(url+"&_token="+localStorage.Token).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }


    post(url, data){
        
        if(data !== undefined){ 
        data._token = localStorage.getItem("Token")}
        return Axios.post(url, data).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }

    put(url, data){
        data._token = localStorage.getItem("Token")
        return Axios.put(url, data).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }

    delete(url, data){
        data._token = localStorage.getItem("Token")
        return Axios.delete(url, data).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }
}

const createQueryString = (select) => {
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
    + (select.q === "" ? "" : "&q=" + select.q)
    + (select.f === "" ? "" : "&f=" + select.f)
    + (select.g === "" ? "" : "&g=" + select.g)
    + (select.s === "" ? "" : "&s=" + select.s)
    + (select.sk === "" ? "" : "&sk=" + select.sk)
    + (select.l === 0 ? "" : "&l=" + select.l)
    + (select.all === "" ? "" : "&all=" + select.all)
    
    return queryS
  }

const Clone = (obj) => {
    let copy;
  
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
  
    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
  
    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = Clone(obj[i]);
        }
        return copy;
    }
  
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = Clone(obj[attr]);
        }
        return copy;
    }
  
    throw new Error("Unable to copy obj! Its type isn't supported.");
}

const DateTimeConverter = (value, format) => {
    const date = moment(value);
    return date.format(format);
}

const GenerateDropDownStatus = (status) => {
    let statusList = []
    statusList.push({'value':"*",'label':"All"})
    Status[status].forEach(row => {
        statusList.push({'value':row.code,'label':row.status})
    })
    return statusList
}

export {apicall, createQueryString, Clone, DateTimeConverter, GenerateDropDownStatus}
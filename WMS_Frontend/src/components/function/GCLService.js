import Axios from "axios";
import MockDataGCL from "../Models/MockDataGCL";
export default class GCLService {
    static isMockData=true
    static mockDataGCL=MockDataGCL
    static API_DOMAIN= window.apipath

    constructor() {}

    static async get(urlPath,qryString){
        var config = {
            method: 'get',
            url: this.API_DOMAIN+urlPath,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {token: localStorage.getItem("Token"), ...qryString},
        };
        return Axios(config).then(res=>res).catch(err=>{ return {_result: {status: 0, message: err.response}} })
    }

    static async post(urlPath,data,qryString=null){
        var config = {
            method: 'post',
            url: this.API_DOMAIN+urlPath,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {token: localStorage.getItem("Token"), ...qryString},
            data: {token: localStorage.getItem("Token"), ...data}
        };
        return Axios(config).then(res=>res).catch(err=>{ return {_result: {status: 0, message: err.response}} })
    }

    // static async GetSPReportAPI() {
    //     var config = {
    //         method: 'get',
    //         url: `${this.API_DOMAIN}/v2/GetSPReportAPI`,
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         params:{
    //             token: localStorage.getItem("Token"),
    //             spname: "Recieve_PLAN_Load_Front"
    //         },
    //         data:{
    //             token: localStorage.getItem("Token"),
    //             spname: "Recieve_PLAN_Load_Front"
    //         }
    //     };
    //     return Axios(config).then(res=>res).catch(err=>{ return {_result: {status: 0, message:'Internet error'}} })
    // }

    // //A01-3
    // static async GetSPReportAPI() {
    //     var config = {
    //         method: 'get',
    //         url: `${this.API_DOMAIN}/v2/GetSPReportAPI`,
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         params:{
    //             token: localStorage.getItem("Token"),
    //             spname: "Recieve_PLAN_Load_Front"
    //         },
    //         data:{
    //             token: localStorage.getItem("Token"),
    //             spname: "Recieve_PLAN_Load_Front"
    //         }
    //     };
    //     return Axios(config).then(res=>res).catch(err=>{ return {_result: {status: 0, message:'Internet error'}} })
    // }

    // //A01
    // static async addRecievePLAN(wms_doc,customer,to_wh,grade,lot,no_strat,no_end,sku,status,qty_pallet,unit) {
    //     var config = {
    //         method: 'post',
    //         url: `${this.API_DOMAIN}/v2/Recieve_PLAN_Front`,
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         data:{
    //             token: localStorage.getItem("Token"),
    //             wms_doc,customer,to_wh,grade,lot,no_strat,no_end,sku,status,qty_pallet,unit
    //         }
    //     };
    //     return Axios(config).then(res=>res).catch(err=>err.response)
    // }

    // //A01-2
    // static async closeRecievePLAN(wms_doc,customer,to_wh,grade,lot,no_strat,no_end,sku,status,qty_pallet,unit) {
    //     var config = {
    //         method: 'post',
    //         url: `${this.API_DOMAIN}/v2/Recieve_PLAN_Close_Front`,
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         data:{
    //             token: localStorage.getItem("Token"),
    //             wms_doc,customer,to_wh,grade,lot,no_strat,no_end,sku,status,qty_pallet,unit
    //         }
    //     };
    //     return Axios(config).then(res=>res).catch(err=>err.response)
    // }
}
using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWCSWebApp.GCLModel.Criteria;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AWCSWebApp.Controllers
{
    public partial class PublicApiController : BaseController
    {
        [HttpGet("list_warhouse")]
        public dynamic List_Warehouse()
        {
            var res = this.ExecBlock<List<acs_Warehouse>>("list_warhouse", (buVO) =>
            {
                return StaticValueManager.GetInstant().Warehouses;
            });

            return res;
        }
        [HttpGet("list_area")]
        public dynamic List_Area()
        {
            var res = this.ExecBlock<List<acs_Area>>("list_area", (buVO) =>
            {
                return StaticValueManager.GetInstant().Areas;
            });

            return res;
        }
        public DynamicParameters GetDapperParam()
        {
            Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
            this.Request.Query.Keys.ToList().ForEach(k =>
            {
                if (k.StartsWith("_")) return;
                string val = this.Request.Query[k];
                parameter.Add(k, string.IsNullOrWhiteSpace(val) ? "%" : val.Replace("*", "%"));
            });
            return parameter;
        }
        [HttpGet("get_inventory_pallet")]
        public dynamic get_inventory_pallet()
        {
            var res = this.ExecBlock<List<dynamic>>("get_inventory_pallet", (buVO) =>
            {
                var res2 = DataADO.GetInstant().QuerySP<dynamic>("RP_Inventory_Pallet", GetDapperParam(), buVO);
                return res2;
            });

            return res;
        }
        [HttpGet("get_sp")]
        public dynamic get_sp()
        {
            var res = this.ExecBlock<List<dynamic>>("get_sp", (buVO) =>
            {
                var res2 = DataADO.GetInstant().QuerySP<dynamic>(this.Request.Query["_sp"], GetDapperParam(), buVO);
                return res2;
            });

            return res;
        }
    }
}

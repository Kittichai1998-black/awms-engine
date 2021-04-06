using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWCSWebApp.GCLModel.Criteria;
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
    }
}

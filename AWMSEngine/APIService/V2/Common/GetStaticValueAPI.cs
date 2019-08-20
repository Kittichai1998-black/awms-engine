using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Common
{
    public class GetStaticValueAPI : BaseAPIService
    {
        public GetStaticValueAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TReq
        {
            public string field;
        }


        protected override dynamic ExecuteEngineManual()
        {
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            var val = ADO.StaticValue.StaticValueManager.GetInstant();

            var fields = val.GetType().GetFields();

            foreach(var f in fields)
            {
                if(f.Name.ToLower() == req.field.ToLower())
                {
                    var res = f.GetValue(val);
                    return res;
                }
            }
            return null;
        }
    }
}

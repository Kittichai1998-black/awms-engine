using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using AWMSEngine.Common;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSEngine.Engine.General;

namespace AWMSEngine.APIService.Data
{
    public class InsUpdDataAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 27;
        }
        public InsUpdDataAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res1 = new InsertSql().Execute(this.Logger, this.BuVO,
                new InsertSql.TReqModel()
                {
                    datas = this.RequestVO.datas,
                    nr = this.RequestVO.nr,
                    pk = this.RequestVO.pk,
                    t = this.RequestVO.t
                });
            this.CommitTransaction();

            var stManager = ADO.StaticValue.StaticValueManager.GetInstant();
            Type stManagerType = stManager.GetType();
            foreach(var mt in stManagerType.GetMethods())
            {
                if (mt.Name.ToUpper().Equals("LOAD" + ((string)this.RequestVO.t).ToUpper().Substring(4)))
                {
                    mt.Invoke(stManager, new object[] { null });
                }
            }
            return res1;
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using AWMSEngine.Engine.V2.General;

namespace AWMSEngine.APIService.V2.Data
{
    public class InsUpdDataAPI : BaseAPIService
    {
        public InsUpdDataAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = new InsertSql.TReqModel()
            {
                datas = this.RequestVO.datas,
                nr = (string)this.RequestVO.nr,
                pk = (string)this.RequestVO.pk,
                t = (string)this.RequestVO.t
            };
            var res1 = new InsertSql().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            this.Logger.LogInfo("Clear Static_Value : " + req.t);
            ADO.WMSStaticValue.StaticValueManager.GetInstant().ClearStaticByTableName(req.t);
            /*var stManager = ADO.StaticValue.StaticValueManager.GetInstant();
            Type stManagerType = stManager.GetType();
            foreach(var mt in stManagerType.GetMethods())
            {
                if (mt.Name.ToUpper().Equals("LOAD" + ((string)this.RequestVO.t).ToUpper().Substring(4)))
                {
                    mt.Invoke(stManager, new object[] { null });
                }
            }*/
            return res1;
        }
    }
}

using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Criteria.API;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class Work_CreateMcWork_byBaseObjTemp : BaseWorkRuntime
    {
  
        public Work_CreateMcWork_byBaseObjTemp(string logref) : base(logref)
        {
        }

        protected override void OnStart()
        {
        }

        protected override void OnRun()
        {

            var baseObjTmps = ADO.WCSDB.BaseObjectADO.GetInstant().ListTemp(this.BuVO);
            baseObjTmps.ForEach(baseObj =>
            {
                var loc = this.StaticValue.GetLocation(baseObj.Location_ID);
                var mc = McController.GetMcRuntimeByLocation(loc.ID.Value);
                if (mc == null || mc.McWork4Receive != null || mc.McWork4Work != null) return;

                try
                {
                    this.BuVO.SqlTransaction_Begin();
                    new CommonEngine.Comm_CreateMcWorkIN_byBaseObjTemp(this.LogRefID, this.BuVO)
                    .Execute(new CommonEngine.Comm_CreateMcWorkIN_byBaseObjTemp.TReq()
                    {
                        baseObjID = baseObj.ID.Value
                    });
                    this.BuVO.SqlTransaction_Commit();
                }
                catch(Exception)
                {
                    this.BuVO.SqlTransaction_Rollback();

                    baseObj.Status = EntityStatus.REMOVE;
                    DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);
                    mc.PostCommand(McCommandType.CM_14);
                    mc.StepTxt = string.Empty;

                    throw;
                }
            });
        }

        protected override void OnStop()
        {
        }
    }
}

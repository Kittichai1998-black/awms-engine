using AWMSEngine.Engine.General;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSModel.Constant.EnumConst;

namespace AWMSEngine.APIService.Mst.Ers
{
    public class PutSAPMovementTypeAPI : BaseAPIService
    {
        public PutSAPMovementTypeAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<ers_SAPMovementType> req = ObjectUtil.DynamicToModel<ers_SAPMovementType>(this.RequestVO.data);
            this.BeginTransaction();
            var res = new MasterPut<ers_SAPMovementType>().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}

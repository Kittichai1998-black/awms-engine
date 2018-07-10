﻿using AMWUtil.Common;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.WM
{
    public class VirtualMapSTOAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            var res = new Engine.Business.VirtualMapStorageObject().Execute(this.Logger, this.BuVO,
                new Business.VirtualMapStorageObject.TReqModle()
                {
                    scanCode = this.RequestVO.scanCode,
                    amount = this.RequestVO.amount,
                    options = ObjectUtil.DynamicToModel<KeyValuePair<string, string>>(this.RequestVO.options),
                    action = (AWMSModel.Constant.EnumConst.VirtualMapSTOActionType)this.RequestVO.action,
                });
            return res;
        }
    }
}

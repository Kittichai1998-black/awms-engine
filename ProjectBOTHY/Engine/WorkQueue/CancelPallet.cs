using ADO.WCSAPI;
using ADO.WMSDB;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectBOTHY.Engine.Business.Document
{
    public class CancelPallet : BaseEngine<CancelPallet.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public string baseCode;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {

            StorageObjectCriteria sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, BuVO);
            if(sto != null)
            {
                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, StorageObjectEventStatus.NEW, null, StorageObjectEventStatus.REJECTED, BuVO);
            }

            return sto;
        }

    }
}

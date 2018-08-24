﻿using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class MasterADO : BaseMSSQLAccess<MasterADO>
    {
        public AWMSModel.Entity.ams_PackMaster GetPackMaster(long skuID, int itemQty, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("SKUMaster_ID",skuID),
                new KeyValuePair<string, object>("ItemQty",itemQty),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }
        public AWMSModel.Entity.ams_PackMaster GetPackMaster(string skuCode, int itemQty, VOCriteria buVO)
        {
            var skuMst = DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
            if (skuMst == null)
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1001, "SKUCode : " + skuCode);
            var packMst = GetPackMaster(skuMst.ID.Value, itemQty, buVO); ;
            return packMst;
        }
    }
}
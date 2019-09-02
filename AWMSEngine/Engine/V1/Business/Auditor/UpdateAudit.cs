﻿using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class UpdateAudit : BaseEngine<UpdateAudit.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public long? docID;
            public string palletCode;
            public List<ItemList> itemLists;

            public class ItemList
            {
                public long stoID;
                public long docItemID;
                public string packCode;
                public decimal? auditQty;
                public decimal qty;
                public decimal baseQty;
                public long unitID;
                public long baseUnitID;
                public string option;

            }
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            if(reqVO.itemLists.Count > 0)
            {
                reqVO.itemLists.ForEach(x =>
                {
                    var getPack = ADO.StorageObjectADO.GetInstant().Get(x.stoID, StorageObjectType.PACK, false, false, this.BuVO);
                    var baseAudited = ADO.StaticValue.StaticValueManager.GetInstant().ConvertToBaseUnitBySKU(getPack.skuID.Value, x.auditQty.HasValue ? x.auditQty.Value : 0, x.unitID);
                    ADO.StorageObjectADO.GetInstant().UpdateAuditing(x.stoID, x.docItemID, x.packCode, x.auditQty.HasValue ? x.auditQty.Value : 0, baseAudited.baseQty,x.option, getPack.parentID.Value, this.BuVO);
                });

                var res = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode, (long?)null, (long?)null, false, true, this.BuVO);
                return res;
            }
            else
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลสำหรับ Audit");
        }
    }
}

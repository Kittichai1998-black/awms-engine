using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class RePackaging : BaseEngine<RePackaging.TReq, RePackaging.TRes>
    {
        //private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();
        public class TReq
        {
            public string oldbstoCode;
            public long oldqty;
            public string newbstoCode;
            public long newQty;
            public long newUnitID;
           
        }
        public class TRes
        {
            public StorageObjectCriteria bsto;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            StorageObjectCriteria mapsto = new StorageObjectCriteria();
            var ckBase = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.newbstoCode, BuVO);
            if (ckBase == null)
            {
                AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(this.BuVO, new ams_BaseMaster()
                {
                    Code = reqVO.newbstoCode,
                    Name = "Pallet",
                    BaseMasterType_ID = 1,
                    Description = "",
                    ObjectSize_ID = 2,
                    Status = EntityStatus.ACTIVE,
                    UnitType_ID = 2,
                    WeightKG = 30

                });
            }
                
            mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.oldbstoCode, null, null, false, true, this.BuVO);
            if (mapsto != null)
            {   //มีพาเลทในระบบแล้ว

                res.bsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(mapsto.id.Value, StorageObjectType.BASE, false, true, this.BuVO); ;
            }
            else
            {

              
            }

            return res;
        }
    }
}

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
            public long psto;
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

            mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.psto, StorageObjectType.PACK, false, false, this.BuVO);
            var newBaseQty = StaticValue.ConvertToBaseUnitBySKU(mapsto.skuID.Value, reqVO.newQty, reqVO.newUnitID);
            if (mapsto != null)
            {   //มีพาเลทในระบบแล้ว

                var cloneSto = mapsto.Clone();
                cloneSto.qty = cloneSto.qty - reqVO.oldqty;
                cloneSto.baseQty = cloneSto.baseQty - newBaseQty.newQty;

                //var updateNewSto = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(cloneSto, this.BuVO);
                //Insert

                var cloneStoInsert = mapsto.Clone();
                cloneStoInsert.id = null;
                cloneStoInsert.qty = reqVO.newQty;
                cloneStoInsert.baseQty = newBaseQty.newQty;
                cloneStoInsert.unitID = reqVO.newUnitID;
                cloneStoInsert.unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == reqVO.newUnitID).Code;

                //var insertNewSto = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(cloneSto, this.BuVO);
            }
            else
            {


            }

            return res;
        }
        private StorageObjectCriteria mapPallet(AMWLogger logger, StorageObjectCriteria psto, TReq reqVO, VOCriteria buVO)
        {
            var palletList = new List<PalletDataCriteriaV2>();
            palletList.Add(new PalletDataCriteriaV2()
            {
                code = reqVO.newbstoCode,
                qty = 1,
                unit = null,
                orderNo = null,
                batch = null,
                lot = null
            });


            return null;
        }





        }
}


using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;

using ADO.WMSStaticValue;
using AWMSEngine.Engine.V2.General;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class RePackaging : BaseEngine<RePackaging.TReq, RePackaging.TRes>
    {
        //private StorageObjectADO ADOSto = ADO.WMSDB.StorageObjectADO.GetInstant();
        public class TReq
        {
            public long psto;
            public string oldbstoCode;
            public long oldqty;
            public string newbstoCode;
            public decimal newQty;
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
            var newbstoBaseMaster = GetBaseSTO(reqVO);

            if(reqVO.newQty <= 0)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "New Qty เท่ากับ 0");

            var bsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.psto, StorageObjectType.BASE, true, true, this.BuVO);

            var ckLoc = StaticValueManager.GetInstant().AreaMasters.Find(y => y.ID == bsto.areaID).AreaMasterType_ID == AreaMasterTypeID.STA_PICK;

            if(ckLoc == false)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่สามารถ DePackaging นี้ได้เนื่องจากอยู่บนคลังสินค้า");


            mapsto = bsto.ToTreeList().FindAll(x => x.id == reqVO.psto).FirstOrDefault();


            var newBaseQty = StaticValue.ConvertToBaseUnitBySKU(mapsto.skuID.Value, reqVO.newQty, reqVO.newUnitID);
            if (bsto != null)
            {
                //มีพาเลทในระบบแล้ว
                var dataupdate = this.updateQtyPallet(this.Logger, mapsto, newBaseQty, reqVO, this.BuVO);
                res.bsto = dataupdate;

                var dataMap = this.mapPallet(this.Logger, mapsto, newBaseQty, newbstoBaseMaster, reqVO, this.BuVO);
                var ck = dataupdate.mapstos.FindAll(x => x.id == reqVO.psto).FirstOrDefault();
                if (ck.qty == 0)
                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(bsto.id.Value, null, null, StorageObjectEventStatus.PACK_REMOVED, this.BuVO);

                var ckQty = dataupdate.mapstos.TrueForAll(x => x.qty == 0);
                if (ckQty)
                {
                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.id.Value, null, null, StorageObjectEventStatus.PACK_REMOVED, this.BuVO);
                    res.bsto = dataMap;
                }
                
            }
            else
            {
                res.bsto = this.mapPallet(this.Logger, mapsto, newBaseQty, newbstoBaseMaster, reqVO, this.BuVO);
            }
            
            return res;
        }

        private StorageObjectCriteria updateQtyPallet(AMWLogger logger, StorageObjectCriteria psto, ConvertUnitCriteria convertUnit, TReq reqVO, VOCriteria buVO)
        {
            var cloneSto = psto.Clone();
            cloneSto.qty = cloneSto.qty - reqVO.oldqty;
            cloneSto.baseQty = cloneSto.baseQty - convertUnit.newQty;

            var updateNewSto = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(cloneSto, this.BuVO);

            var newPallet = ADO.WMSDB.StorageObjectADO.GetInstant().Get(updateNewSto, StorageObjectType.BASE, true, true, this.BuVO);
            return newPallet;
        }
        private StorageObjectCriteria mapPallet(AMWLogger logger, StorageObjectCriteria psto, ConvertUnitCriteria convertUnit,ams_BaseMaster newbstoBaseMaster,TReq reqVO, VOCriteria buVO)
        {
            //Insert
            var bsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.psto, StorageObjectType.PACK, true, false, this.BuVO);

            var oldDisto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                 new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Des_StorageObject_ID",psto.id, SQLOperatorType.EQUALS),
                    //new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.PUTAWAY, SQLOperatorType.EQUALS),
                 }, this.BuVO).FirstOrDefault();

            var cloneBsto = bsto.ToTreeList().Find(x=>x.type== StorageObjectType.BASE).Clone();
            cloneBsto.id = null;
            cloneBsto.code = reqVO.newbstoCode;
            cloneBsto.mstID = newbstoBaseMaster.ID;
            
            var insertNewSto = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(cloneBsto, this.BuVO);

           
            var cloneStoInsert = psto.Clone();
            cloneStoInsert.id = null;
            cloneStoInsert.parentID = insertNewSto;
            cloneStoInsert.qty = reqVO.newQty;
            cloneStoInsert.baseQty = convertUnit.newQty;
            cloneStoInsert.unitID = reqVO.newUnitID;
            cloneStoInsert.unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == reqVO.newUnitID).Code;

            var insertNewStopack = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(cloneStoInsert, this.BuVO);

            var newPallet = ADO.WMSDB.StorageObjectADO.GetInstant().Get(insertNewSto, StorageObjectType.BASE, true, true, this.BuVO);


            amt_DocumentItemStorageObject dataNewDisto = new amt_DocumentItemStorageObject()
            {
              IsLastSeq = oldDisto.IsLastSeq,
              DocumentType_ID = null,
              WorkQueue_ID = null,
              DocumentItem_ID = null,
              Sou_StorageObject_ID = oldDisto.Sou_StorageObject_ID,
              Sou_WaveSeq_ID = null,
              Des_StorageObject_ID = insertNewStopack,
              Des_WaveSeq_ID = null,
              Quantity = reqVO.newQty,
              UnitType_ID = reqVO.newUnitID,
              BaseQuantity = convertUnit.newQty,
              BaseUnitType_ID = oldDisto.BaseUnitType_ID,
              Status = oldDisto.Status
            };

            ADO.WMSDB.DistoADO.GetInstant().Insert(dataNewDisto, this.BuVO);


            return newPallet;
        }
        private ams_BaseMaster GetBaseSTO(TReq reqVO)
        {
            var baseMasterData = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.newbstoCode),
                    new KeyValuePair<string,object>("Status",1),
                }, this.BuVO);

            if (baseMasterData.Count <= 0)
            {
                ADO.WMSDB.DataADO.GetInstant().Insert<ams_BaseMaster>(this.BuVO, new ams_BaseMaster()
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
            var newbstoBaseMaster = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.newbstoCode, BuVO);

            return newbstoBaseMaster;
        }
    }
}


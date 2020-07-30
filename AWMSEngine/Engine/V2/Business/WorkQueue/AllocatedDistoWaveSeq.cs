using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class AllocatedDistoWaveSeq : BaseEngine<AllocatedDistoWaveSeq.TReq, amt_DocumentItemStorageObject>
    {
        public class TReq
        {
            public long PackStoID;
            public decimal PackStoBaseQty;
            public long DocItemID;
            public long WaveID;
        }

        protected override amt_DocumentItemStorageObject ExecuteEngine(TReq reqVO)
        {
            amt_StorageObject psto = ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(reqVO.PackStoID, this.BuVO);
            var qtyConvert = StaticValue.ConvertToNewUnitByPack(psto.PackMaster_ID, reqVO.PackStoBaseQty, psto.BaseUnitType_ID, psto.UnitType_ID);
            var wave = ADO.WaveADO.GetInstant().GetWaveAndSeq(reqVO.WaveID, this.BuVO);
            if (wave.WaveSeqs.First().End_StorageObject_EventStatus != StorageObjectEventStatus.ALLOCATED)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Wave Seq(1) จะต้องมี end status 'Allocated' เท่านั้น");

            var disto = ADO.DistoADO.GetInstant().Insert(new AWMSModel.Entity.amt_DocumentItemStorageObject
            {
                ID =null,
                WorkQueue_ID = null,
                DocumentItem_ID = reqVO.DocItemID,
                DocumentType_ID = null,
                Sou_WaveSeq_ID = wave.WaveSeqs.First(x => x.Seq == 1).ID,
                Sou_StorageObject_ID = reqVO.PackStoID,
                Des_StorageObject_ID = reqVO.PackStoID,
                Des_WaveSeq_ID = wave.WaveSeqs.First(x => x.Seq == 2).ID,
                BaseQuantity = reqVO.PackStoBaseQty,
                BaseUnitType_ID = psto.BaseUnitType_ID,
                Quantity = qtyConvert.newQty,
                UnitType_ID = qtyConvert.newUnitType_ID,
                Status = EntityStatus.INACTIVE
            }, this.BuVO);

            //ADO.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.ACTIVE, this.BuVO);
            
            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(psto.ParentStorageObject_ID.Value, 
                null, EntityStatus.ACTIVE, 
                wave.WaveSeqs.First(x => x.Seq == 1).Start_StorageObject_EventStatus, this.BuVO);


            var docItem = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(reqVO.DocItemID, this.BuVO);
            ADO.DocumentADO.GetInstant().UpdateStatusToChild(docItem.Document_ID, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);


            return disto;
        }

    }
}

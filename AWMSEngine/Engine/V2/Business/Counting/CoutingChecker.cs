using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Counting
{
    public class CoutingChecker : BaseEngine<CoutingChecker.TReq, GetSTOCouting.TRes>
    {
       
        public class TReq
        {
            public long bstoID;
            public long pstoID;
            public long pi_docID;
            public long pi_docItemID;
            public long distoID;
            public decimal coutingQty;
            public string remark;
        }
        protected override GetSTOCouting.TRes ExecuteEngine(TReq reqVO)
        {
            var doc = ADO.WMSDB.DocumentADO.GetInstant().Get(reqVO.pi_docID, this.BuVO);
            
            doc.DocumentItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(reqVO.pi_docID, this.BuVO);

            var pstos = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.pstoID, StorageObjectType.PACK, false, false, this.BuVO);
            if(pstos == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบสินค้าที่ต้องการตรวจนับ");

            var docitem = doc.DocumentItems.Find(y => y.ID == reqVO.pi_docItemID);
            if (docitem == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบสินค้าที่ต้องการตรวจนับ");

            var disto = docitem.DocItemStos.Find(z => z.ID == reqVO.distoID);
            if (disto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ DocItemStos");

            var qID = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_WorkQueue>(disto.WorkQueue_ID, this.BuVO);
            if (qID != null && qID.EventStatus != WorkQueueEventStatus.CLOSED)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณารอสักครู่ กระบวนการเบิกยังไม่จบการทำงาน");
            
            var updSto = new StorageObjectCriteria();
            updSto = pstos.Clone();
            updSto.qty = reqVO.coutingQty;
            var qtyConvert = StaticValue.ConvertToNewUnitBySKU(pstos.skuID.Value, reqVO.coutingQty, pstos.unitID, pstos.baseUnitID);
            updSto.baseQty = qtyConvert.newQty;
            updSto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(pstos.options,
                      new KeyValuePair<string, object>[] {
                           new KeyValuePair<string, object>(OptionVOConst.OPT_REMARK, reqVO.remark)
                      });
            updSto.eventStatus = StorageObjectEventStatus.COUNTED;
            ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);

            disto.Des_StorageObject_ID = updSto.id;
            disto.Quantity = reqVO.coutingQty - pstos.qty;
            var distoqtyConvert = StaticValue.ConvertToNewUnitBySKU(pstos.skuID.Value, disto.Quantity.Value, pstos.unitID, pstos.baseUnitID);
            disto.BaseQuantity = distoqtyConvert.newQty;
            disto.Status = EntityStatus.DONE;
            ADO.WMSDB.DistoADO.GetInstant().Update(disto, this.BuVO);



            GetSTOCouting.TRes res = new GetSTOCouting.TRes();
            res = new GetSTOCouting().Execute(this.Logger, this.BuVO, new GetSTOCouting.TReq() { bstoID = reqVO.bstoID });
            if (res == null)
            {//disto ปิดหมด 

                res = new GetSTOCouting.TRes()
                {
                    docIDs = new List<long>() { reqVO.pi_docID }
                };
            }
            else
            {
                res.docIDs = new List<long>() { reqVO.pi_docID };
            }
            return res;
        }

    }
}

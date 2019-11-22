using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
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
                public string remark;

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

                    getPack.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(getPack.options,
                       new KeyValuePair<string, object>[] {
                           new KeyValuePair<string, object>("remark",x.remark)
                       });

                    ADO.StorageObjectADO.GetInstant().PutV2(getPack, this.BuVO);

                    //AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(x.stoID, this.BuVO,
                    //    new KeyValuePair<string, object>[] {
                    //        new KeyValuePair<string, object>("Options","remark=" +x.remark)
                    //    });

                });
                var getDisto = ADO.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID.Value, this.BuVO);

                var Disto = new List<amt_DocumentItemStorageObject>();
                getDisto.Select(x => x.DocItemStos).ToList().ForEach(x => { Disto.AddRange(x); }) ;


                var CheckDisto = Disto.TrueForAll(x => x.Status == EntityStatus.ACTIVE);
                if (CheckDisto)
                {
                    var WorkedDoc = new  WorkedDocument().Execute(this.Logger, this.BuVO,new List<long> { reqVO.docID.Value });
                    var ClosingDoc = new  ClosingDocument().Execute(this.Logger, this.BuVO, WorkedDoc);
                    var ClosedDoc = new  ClosedDocument().Execute(this.Logger, this.BuVO, ClosingDoc);

                   // ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.CLOSED,this.BuVO);
                }

                 var res = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode, (long?)null, (long?)null, false, true, this.BuVO);
                return res;
            }
            else
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลสำหรับ Audit");
        }
    }
}

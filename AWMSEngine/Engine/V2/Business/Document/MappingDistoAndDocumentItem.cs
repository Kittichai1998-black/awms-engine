using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class MappingDistoAndDocumentItem : BaseEngine<MappingDistoAndDocumentItem.TReq, MappingDistoAndDocumentItem.TRes>
    {
        public class TReq
        {
            public long baseID;
            public DocumentProcessTypeID docProcessType;
        }

        public class TRes
        {
            public StorageObjectCriteria sto;
            public long? GR_ID;
            public string GR_Code;
            public long? PA_ID;
            public string PA_Code;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var sto = StorageObjectADO.GetInstant().Get(reqVO.baseID, StorageObjectType.BASE, false, true, this.BuVO);

            var packList = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);

            var distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("Sou_StorageObject_ID", string.Join(',',packList), SQLOperatorType.IN),
                new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.PUTAWAY, SQLOperatorType.EQUALS)
            }, this.BuVO);

            packList.ForEach(pack =>
            {
                var chkCreatePA = StaticValue.Configs.Find(x=> x.DataKey == "USE_AUTO_CREATE_GR").DataValue;
                var chkCreateGR = StaticValue.Configs.Find(x => x.DataKey == "USE_AUTO_CREATE_PA").DataValue;

                var disto = distos.Find(disto => disto.Sou_StorageObject_ID == pack.id);
                if(disto != null)
                {
                    if(disto.BaseQuantity != pack.baseQty)
                    {
                        var docItem = DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria() 
                        { field = "ID", value = disto.DocumentItem_ID, operatorType = SQLOperatorType.EQUALS }, this.BuVO).FirstOrDefault();
                        if(docItem.BaseQuantity > pack.baseQty)
                        {
                            if (chkCreatePA == "true")
                            {
                                if (chkCreateGR == "true")
                                {
                                    var _docItems = DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
                                    {
                                        new SQLConditionCriteria("Code", pack.mstID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("UnitType_ID", pack.unitID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("OrderNo", pack.orderNo, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Batch", pack.batch, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Lot", pack.lot, SQLOperatorType.EQUALS)
                                    }, this.BuVO);

                                }
                                else
                                {
                                    var createDoc = new V2.Business.Document.CreateDocument();
                                    createDoc.Execute(this.Logger, this.BuVO, new CreateDocument.TReq()
                                    {

                                    });
                                }
                            }
                            else
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Cannot Mapping Pack and DocumentItem");
                            }
                        }
                        else
                        {
                            disto.BaseQuantity = pack.baseQty;
                            disto.Quantity = pack.qty;
                            DistoADO.GetInstant().Update(disto, this.BuVO);
                        }
                    }
                }
                else
                {

                }
            });






            return null;
        }
    }
}

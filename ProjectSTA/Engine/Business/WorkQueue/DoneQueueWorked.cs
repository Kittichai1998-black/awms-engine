using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.WorkQueue
{
    public class DoneQueueWorked : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {
            var docLists = new List<long>();
            reqVO.ForEach(x =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                if (docs != null)
                {

                    var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x, buVO);
                    docItems.ForEach(docItem =>
                    {
                        if (docItem.DocItemStos.TrueForAll(z => z.Status == EntityStatus.ACTIVE))
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, buVO);
                            if (docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                            {
                                var sum_disto = docItem.DocItemStos.Sum(t => t.Quantity);
                                    //ถ้า STO ของที่เบิก เบิกไม่หมด จะต้องเอาของที่เหลือไปสร้างเอกสาร Picking Return
                                    if (sum_disto > docItem.Quantity)
                                {   //StoQTY = 150 > จำนวนที่ขอเบิก 100 
                                    //เอา 50 ที่เหลือ ไปสร้างเอกสาร Picking Return
                                        CreateGRDocument(docItem, logger, buVO);
                                }
                            }

                        }
                    });

                    var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, buVO);
                    if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                    {
                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, buVO);
                        RemoveOPTDocument(x, docs.Options, buVO);
                        docLists.Add(x);
                    }
                    else
                    {
                        buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                        {
                            docID = x,
                            msgError = "Status of all document items didn't 'WORKED'."
                        });
                    }


                }
                else
                {
                    buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                    {
                        docID = x,
                        msgError = "Document Not Found"
                    });
                }

            });

            return docLists;
        }
        private void CreateGRDocument(amt_DocumentItem docItem, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var document = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(docItem.Document_ID, buVO);
            var sum_disto = docItem.DocItemStos.Sum(t => t.Quantity);
            var sumBase_disto = docItem.DocItemStos.Sum(t => t.BaseQuantity);

            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = docItem.Document_ID,
                Lot = document.Lot,
                Batch = document.Batch,
                For_Customer_ID = null,
                Sou_Customer_ID = null,
                Sou_Supplier_ID = null,
                Sou_Branch_ID = document.Sou_Branch_ID,
                Sou_Warehouse_ID = document.Sou_Warehouse_ID,
                Sou_AreaMaster_ID = null,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = document.Sou_Branch_ID,
                Des_Warehouse_ID = document.Sou_Warehouse_ID,
                Des_AreaMaster_ID = null,

                DocumentDate = DateTime.Now,
                ActionTime = DateTime.Now,
                MovementType_ID = MovementType.FG_PICK_RETURN_WM,
                RefID = document.RefID,
                Ref1 = document.Ref1,
                Ref2 = document.Ref2,

                DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                EventStatus = DocumentEventStatus.NEW,

                Remark = document.Remark,
                Options = null,
                Transport_ID = null,

                DocumentItems = new List<amt_DocumentItem>(),

            };
            doc.DocumentItems.Add(new amt_DocumentItem()
            {
                ID = null,
                Code = docItem.Code,
                SKUMaster_ID = docItem.SKUMaster_ID,
                PackMaster_ID = docItem.PackMaster_ID,

                Quantity = sum_disto - docItem.Quantity,
                UnitType_ID = docItem.UnitType_ID,
                BaseQuantity = sumBase_disto - docItem.BaseQuantity,
                BaseUnitType_ID = docItem.BaseUnitType_ID,

                OrderNo = docItem.OrderNo,
                Batch = docItem.Batch,
                Lot = docItem.Lot,

                Options = null,
                ExpireDate = docItem.ExpireDate,
                ProductionDate = docItem.ProductionDate,
                Ref1 = docItem.Ref1,
                Ref2 = docItem.Ref2,
                RefID = docItem.RefID,

                EventStatus = DocumentEventStatus.NEW,
                DocItemStos = new List<amt_DocumentItemStorageObject>()

            });

            var docnew = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO);

        }
        private void RemoveOPTDocument(long docID, string options, VOCriteria buVO)
        {
            //remove 
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_ERROR));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_Document>(docID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}

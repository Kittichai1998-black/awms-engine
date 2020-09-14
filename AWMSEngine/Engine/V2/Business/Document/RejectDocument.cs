using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class RejectDocument : BaseEngine<RejectDocument.TReq, List<amt_Document>>
    {
        public class TReq
        {
            public List<long> docIDs;
            public string remark;
        }



        protected override List<amt_Document> ExecuteEngine(TReq reqVO)
        {

            List<amt_Document> docs = new List<amt_Document>();
            foreach (var docID in reqVO.docIDs)
            {
                var dataDoc = ADO.DocumentADO.GetInstant().Get(docID, this.BuVO);
                if (dataDoc != null)
                {
                    if (dataDoc.EventStatus == DocumentEventStatus.NEW)
                    {
                        if (dataDoc.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE)
                        {
                            //var docParent = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
                            var listDocChild = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                                                new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("ParentDocument_ID",dataDoc.ID, SQLOperatorType.EQUALS),
                                                }, this.BuVO);

                            foreach (var docChild in listDocChild)
                            {
                                this.checkStoDocument(this.Logger, docChild, reqVO.remark, this.BuVO);
                            }

                            this.updateDocChild(dataDoc, reqVO.remark, this.BuVO);

                        }
                        else
                        {
                            this.checkStoDocument(this.Logger, dataDoc, reqVO.remark, this.BuVO);
                            if (dataDoc.DocumentType_ID == DocumentTypeID.PUTAWAY)
                                this.updateDocParent(dataDoc, this.BuVO);
                        }

                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สถานะเอกสารต้องเป็น New เท่านั้น");
                    }
                    docs.Add(dataDoc);
                }
            }
            return docs;
        }

        private void checkStoDocument(AMWLogger logger, amt_Document dataDoc, string remark, VOCriteria buVO)
        {
            List<amt_StorageObject> ItemsSto = new List<amt_StorageObject>();
            var grDocItem = ADO.DocumentADO.GetInstant().ListItem(dataDoc.ID.Value, this.BuVO);


            grDocItem.ForEach(item =>
            {
                ItemsSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                   new SQLConditionCriteria[] {
                               new SQLConditionCriteria("EventStatus",DocumentEventStatus.NEW,SQLOperatorType.EQUALS),
                               new SQLConditionCriteria("Options","%_docitem_id="+item.ID+"%", SQLOperatorType.LIKE),
                   }, this.BuVO);

                if (ItemsSto != null)
                {
                    ItemsSto.ForEach(x =>
                    {
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.ParentStorageObject_ID.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                        var disto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                         new SQLConditionCriteria[] {
                                new SQLConditionCriteria("Sou_StorageObject_ID",x.ID, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status",EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                         }, this.BuVO).FirstOrDefault();

                        disto.Status = EntityStatus.REMOVE;
                        DistoADO.GetInstant().Update(disto, this.BuVO);
                    });

                }
            });
            ADO.DocumentADO.GetInstant().UpdateStatusToChild(dataDoc.ID.Value, null, null, DocumentEventStatus.REJECTED, this.BuVO);

            ADO.DataADO.GetInstant().UpdateByID<amt_Document>(dataDoc.ID.Value, this.BuVO,
            new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("remark",remark)
            });


        }
        private void updateDocParent(amt_Document dataDoc, VOCriteria buVO)
        {
            var docParent = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
            var listDocChild = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ParentDocument_ID",docParent.ID, SQLOperatorType.EQUALS),
                                }, this.BuVO);
            var ckDocChild = listDocChild.TrueForAll(x => x.EventStatus == DocumentEventStatus.REJECTED);
            if (ckDocChild)
            {
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(docParent.ID.Value, null, null, DocumentEventStatus.REJECTED, this.BuVO);
            }
        }
        private void updateDocChild(amt_Document dataDoc, string remark, VOCriteria buVO)
        {
            var docParent = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ID, this.BuVO);
            var listDocChild = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ParentDocument_ID",docParent.ID, SQLOperatorType.EQUALS),
                                }, this.BuVO);
            var ckDocChild = listDocChild.TrueForAll(x => x.EventStatus == DocumentEventStatus.REJECTED);
            if (ckDocChild)
            {
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(docParent.ID.Value, null, null, DocumentEventStatus.REJECTED, this.BuVO);
            }
            ADO.DataADO.GetInstant().UpdateByID<amt_Document>(dataDoc.ID.Value, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                    new KeyValuePair<string, object>("remark",remark)
                });

            listDocChild.ForEach(x =>
            {
                ADO.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                    new KeyValuePair<string, object>[]
                    {
                        new KeyValuePair<string, object>("remark",remark)
                    });
            });


        }

    }
}

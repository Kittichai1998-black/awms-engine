using ADO.WMSDB;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectBOTHY.Engine.Document
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
                var dataDoc = ADO.WMSDB.DocumentADO.GetInstant().Get(docID, this.BuVO);

                if (dataDoc != null)
                {
                    if (dataDoc.DocumentProcessType_ID != DocumentProcessTypeID.WM_TRANSFER_MANUAL)
                    {
                        throw new AMWException(Logger, AMWExceptionCode.V2002, "ไม่สามารถ Reject เอกสารที่มี DocumentProcessType เป็น WM_TRANSFER_AUTO");
                    }
                    else
                    {
                        if (dataDoc.EventStatus == DocumentEventStatus.NEW)
                        {
                            if (dataDoc.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || dataDoc.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                            {
                                //var docParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
                                var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
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
                                if (dataDoc.DocumentType_ID == DocumentTypeID.PUTAWAY || dataDoc.DocumentType_ID == DocumentTypeID.PICKING)
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
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถ Reject เอกสารได้");
                }
            }
            return docs;
        }

        private void checkStoDocument(AMWLogger logger, amt_Document dataDoc, string remark, VOCriteria buVO)
        {
            List<amt_StorageObject> ItemsSto = new List<amt_StorageObject>();
            var grDocItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(dataDoc.ID.Value, this.BuVO);


            grDocItem.ForEach(item =>
            {
                ItemsSto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                   new SQLConditionCriteria[] {
                               new SQLConditionCriteria("EventStatus",DocumentEventStatus.NEW,SQLOperatorType.EQUALS),
                               new SQLConditionCriteria("Options","%_docitem_id="+item.ID+"%", SQLOperatorType.LIKE),
                   }, this.BuVO);

                if (ItemsSto != null)
                {
                    ItemsSto.ForEach(x =>
                    {
                        ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(x.ParentStorageObject_ID.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                        var disto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                         new SQLConditionCriteria[] {
                                new SQLConditionCriteria("Sou_StorageObject_ID",x.ID, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status",EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                         }, this.BuVO).FirstOrDefault();

                        disto.Status = EntityStatus.REMOVE;
                        DistoADO.GetInstant().Update(disto, this.BuVO);
                    });

                }
            });
            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(dataDoc.ID.Value, null, null, DocumentEventStatus.REJECTED, this.BuVO);

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(dataDoc.ID.Value, this.BuVO,
            new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("remark",remark)
            });


        }
        private void updateDocParent(amt_Document dataDoc, VOCriteria buVO)
        {
            var docParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
            var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ParentDocument_ID",docParent.ID, SQLOperatorType.EQUALS),
                                }, this.BuVO);
            var ckDocChild = listDocChild.TrueForAll(x => x.EventStatus == DocumentEventStatus.REJECTED);
            if (ckDocChild)
            {
                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docParent.ID.Value, null, null, DocumentEventStatus.REJECTED, this.BuVO);
            }
        }
        private void updateDocChild(amt_Document dataDoc, string remark, VOCriteria buVO)
        {
            var docParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ID, this.BuVO);
            var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ParentDocument_ID",docParent.ID, SQLOperatorType.EQUALS),
                                }, this.BuVO);
            var ckDocChild = listDocChild.TrueForAll(x => x.EventStatus == DocumentEventStatus.REJECTED);
            if (ckDocChild)
            {
                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docParent.ID.Value, null, null, DocumentEventStatus.REJECTED, this.BuVO);
            }
            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(dataDoc.ID.Value, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                    new KeyValuePair<string, object>("remark",remark)
                });

            listDocChild.ForEach(x =>
            {
                ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                    new KeyValuePair<string, object>[]
                    {
                        new KeyValuePair<string, object>("remark",remark)
                    });
            });


        }

    }
}

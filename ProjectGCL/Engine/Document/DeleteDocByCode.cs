using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.Issued;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;
using System.Text.RegularExpressions;
using ADO.WMSDB;
using AMSModel.Entity;
using AMSModel.Criteria;
using AMSModel.Constant.EnumConst;

namespace ProjectGCL.Engine.Document
{
    public class DeleteDocByCode : BaseEngine<DeleteDocByCode.TReq, amt_Document>
    {

        public class TReq
        {
            public string documentCode;
        }
        public class TRes
        {
            public string documentCode;

        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            var dataDoc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                     new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.documentCode, SQLOperatorType.EQUALS)
                     }, this.BuVO).FirstOrDefault();
            if (dataDoc != null)
            {
                if (dataDoc.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE)
                {
                    var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ParentDocument_ID",dataDoc.ID, SQLOperatorType.EQUALS),
                        }, this.BuVO);

                    foreach (var docChild in listDocChild)
                    {
                        this.checkStoDocument(this.Logger, docChild, this.BuVO);
                    }
                    this.updateDocChild(dataDoc, this.BuVO);

                }
                else if (dataDoc.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                {
                    //GOODS_ISSUE
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "DocumentType ของเอกสาร " + reqVO.documentCode + " ไม่ถูกต้อง");
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่พบเอกสาร " + reqVO.documentCode);
            }

            return dataDoc;

        }
        private void checkStoDocument(AMWLogger logger, amt_Document dataDoc, VOCriteria buVO)
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
                        ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(x.ParentStorageObject_ID.Value, null, null, StorageObjectEventStatus.PACK_REMOVED, this.BuVO);

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
            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(dataDoc.ID.Value, null, null, DocumentEventStatus.REMOVED, this.BuVO);

        }

        private void updateDocChild(amt_Document dataDoc, VOCriteria buVO)
        {
            var docParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ID, this.BuVO);
            var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ParentDocument_ID",docParent.ID, SQLOperatorType.EQUALS),
                                }, this.BuVO);
            var ckDocChild = listDocChild.TrueForAll(x => x.EventStatus == DocumentEventStatus.REMOVED);
            if (ckDocChild)
            {
                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docParent.ID.Value, null, null, DocumentEventStatus.REMOVED, this.BuVO);
            }
            

        }

    }
}

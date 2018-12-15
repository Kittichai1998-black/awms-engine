﻿using AMWUtil.Common;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class DocumentADO : ADO.BaseMSSQLAccess<DocumentADO>
    {


        public List<amt_DocumentItemStorageObject> ListStoIDInDocs(List<long> stoids, DocumentTypeID docTypeID, VOCriteria buVO)
        {
            return ListStoIDInDocs(null, stoids, docTypeID, buVO);
        }
        public List<amt_DocumentItemStorageObject> ListStoIDInDocs(long docID, VOCriteria buVO)
        {
            return ListStoIDInDocs(docID, null, null, buVO);
        }
        public List<amt_DocumentItemStorageObject> ListStoIDInDocs(long? docID, List<long> stoids, DocumentTypeID? docTypeID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("documentID", docID);
            param.Add("storageObjectIDs", stoids == null ? string.Empty : string.Join(',', stoids));
            param.Add("documentTypeID", docTypeID);
            var res = this.Query<amt_DocumentItemStorageObject>("SP_STO_IN_DOCLOCK", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public STOCountDocLockCriteria STOCountDocLock(long skuID, long? packMstID, long? warehouseID, long? forCustomerID, string batch, string lot, DocumentTypeID docTypeID, VOCriteria buVO)
        {
            return this.STOCountDocLock(skuID, packMstID, warehouseID, forCustomerID, batch, lot, new DocumentTypeID[] { docTypeID }, buVO);
        }
        public STOCountDocLockCriteria STOCountDocLock(long skuID, long? packMstID, long? warehouseID, long? forCustomerID, string batch, string lot, DocumentTypeID[] docTypeIDs, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("skuID", skuID);
            param.Add("packMstID", packMstID);
            param.Add("forCustomerID", forCustomerID);
            param.Add("warehouseID", warehouseID);
            param.Add("batch", ObjectUtil.EmptyToNull(batch));
            param.Add("lot", ObjectUtil.EmptyToNull(lot));
            param.Add("docTypeIDs", string.Join(',', docTypeIDs.Select(x => (int)x)));
            var res = this.Query<STOCountDocLockCriteria>("SP_STO_COUNT_DOCLOCK", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).FirstOrDefault();
            return res;
        }
        public int UpdateEventStatus(long id, DocumentEventStatus eventStatus, VOCriteria buVO)
        {
            var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(eventStatus);
            var res = DataADO.GetInstant().UpdateByID<amt_Document>(id, buVO,
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("EventStatus", eventStatus),
                    new KeyValuePair<string, object>("Status", status)
                });
            return res;
        }
        public int UpdateItemEventStatus(long id, DocumentEventStatus eventStatus, VOCriteria buVO)
        {
            var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(eventStatus);
            var res = DataADO.GetInstant().UpdateByID<amt_DocumentItem>(id, buVO,
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("EventStatus", eventStatus),
                    new KeyValuePair<string, object>("Status", status)
                });
            return res;
        }

        public amt_Document Create(amt_Document doc, VOCriteria buVO)
        {
            var docItems = doc.DocumentItems;

            if (!doc.ID.HasValue)
            {

                Dapper.DynamicParameters param = new Dapper.DynamicParameters();
                param.Add("@parentDocument_ID", doc.ParentDocument_ID);
                param.Add("@documentType_ID", doc.DocumentType_ID);

                param.Add("@sou_customer_ID", doc.Sou_Customer_ID);
                param.Add("@sou_supplier_ID", doc.Sou_Supplier_ID);
                param.Add("@sou_branch_ID", doc.Sou_Branch_ID);
                param.Add("@sou_warehouse_ID", doc.Sou_Warehouse_ID);
                param.Add("@sou_areaMaster_ID", doc.Sou_AreaMaster_ID);

                param.Add("@des_customer_ID", doc.Des_Customer_ID);
                param.Add("@des_supplier_ID", doc.Des_Supplier_ID);
                param.Add("@des_branch_ID", doc.Des_Branch_ID);
                param.Add("@des_warehouse_ID", doc.Des_Warehouse_ID);
                param.Add("@des_areaMaster_ID", doc.Des_AreaMaster_ID);

                param.Add("@transport_ID", doc.Transport_ID);

                param.Add("@actionTime", doc.ActionTime);
                param.Add("@documentDate", doc.DocumentDate);
                param.Add("@options", doc.Options);
                param.Add("@refID", doc.RefID);
                param.Add("@ref1", doc.Ref1);
                param.Add("@ref2", doc.Ref2);

                param.Add("@for_customer_ID", doc.For_Customer_ID);
                param.Add("@batch", doc.Batch);
                param.Add("@lot", doc.Lot);

                param.Add("@remark", doc.Remark);
                param.Add("@eventStatus", doc.EventStatus);
                param.Add("@actionBy", buVO.ActionBy);

                doc = this.Query<amt_Document>("SP_DOC_CREATE",
                                    System.Data.CommandType.StoredProcedure,
                                    param,
                                    buVO.Logger, buVO.SqlTransaction)
                                    .FirstOrDefault();
            }
            doc.DocumentItems = new List<amt_DocumentItem>();

            docItems.ForEach(x =>
            {
                if (!x.ID.HasValue)
                {
                    x.Document_ID = doc.ID.Value;
                    var docItem = this.CreateItem(x, buVO);
                    doc.DocumentItems.Add(docItem);
                }
                else
                {
                    doc.DocumentItems.Add(x);
                }
            });

            return doc;

        }
        public amt_DocumentItem CreateItem(amt_DocumentItem docItem, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@document_ID", docItem.Document_ID);
            param.Add("@linkDocumentID", docItem.LinkDocument_ID);
            param.Add("@packMaster_ID", docItem.PackMaster_ID);
            param.Add("@sku_ID", docItem.SKUMaster_ID);
            param.Add("@code", docItem.Code);
            param.Add("@quantity", docItem.Quantity);
            param.Add("@expireDate", docItem.ExpireDate);
            param.Add("@options", docItem.Options);
            param.Add("@productionDate", docItem.ProductionDate);
            param.Add("@ref1", docItem.Ref1);
            param.Add("@ref2", docItem.Ref2);
            param.Add("@ref3", docItem.Ref3);
            param.Add("@eventStatus", docItem.EventStatus);
            //param.Add("@storageObject_IDs", docItem.StorageObjectIDs == null ? null : string.Join(",", docItem.StorageObjectIDs));
            param.Add("@actionBy", buVO.ActionBy);

            var tmp = docItem.StorageObjectIDs;
            docItem = this.Query<amt_DocumentItem>("SP_DOCITEM_CREATE",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction)
                                .FirstOrDefault();

            this.MappingSTO(docItem.ID.Value, tmp, buVO);
            docItem.StorageObjectIDs = tmp;

            /*docItem.StorageObjectIDs = ADO.DataADO.GetInstant()
                .SelectBy<amt_DocumentItemStorageObject>("DocumentItem_ID", docItem.ID.Value, buVO)
                .Select(x=>x.StorageObject_ID)
                .ToList();*/

            return docItem;
        }
        public int Close(long documentID, bool needClose, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@documentID", documentID);
            param.Add("@needClose", needClose);

            return this.Execute("SP_DOC_CLOSED",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
        }

        public int MappingSTO(long documentItemID, List<long> storageObjectIDs, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@documentItemID", documentItemID);
            param.Add("@storageObjectIDs", string.Join(",", storageObjectIDs));
            param.Add("@actionBy", buVO.ActionBy);
            return this.Execute("SP_DOCITEM_MAP_STO",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
        }
        public List<amt_Document> ListBySTO(List<long> storageObjectIDs, VOCriteria buVO)
        {
            return this.ListBySTO(storageObjectIDs, null, buVO);
        }
        public List<amt_Document> ListBySTO(List<long> storageObjectIDs, DocumentTypeID? docTypeID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("storageObjectIDs", string.Join(",", storageObjectIDs));
            param.Add("docTypeID", docTypeID);
            return this.Query<amt_Document>("SP_DOC_LIST_BYSTOID",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
        }
        public List<SPOutDocItemCanMap> ListItemCanMap(string packCode,DocumentTypeID docTypeID,string batch,string lot, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("packCode", packCode);
            param.Add("docTypeID", docTypeID);
            param.Add("batch", batch);
            param.Add("lot", lot);
            var res = this.Query<SPOutDocItemCanMap>("SP_DOCITEM_LIST_CANMAP",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public List<amt_DocumentItem> ListItemBySTO(List<long> storageObjectIDs, VOCriteria buVO)
        {
            return ListItemBySTO(storageObjectIDs, null, buVO);
        }
        public List<amt_DocumentItem> ListItemBySTO(List<long> storageObjectIDs, DocumentTypeID? docTypeID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("storageObjectIDs", string.Join(",", storageObjectIDs));
            param.Add("docTypeID", docTypeID);
            return this.Query<amt_DocumentItem>("SP_DOCITEM_LIST_BYSTOID",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
        }
        public List<SPOutDocTargetCriteria> Target(List<long> docIDs, DocumentTypeID docTypeID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("docIDs", string.Join(",", docIDs));
            param.Add("docTypeID", docTypeID);
            return this.Query<SPOutDocTargetCriteria>("SP_DOC_TARGET",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
        }

        public int UpdateStatusToChild(long docID,
            DocumentEventStatus? fromEventStatus, EntityStatus? fromStatus, DocumentEventStatus? toEventStatus, VOCriteria buVO)
        {
            EntityStatus? toStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(toEventStatus);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@docID", docID);
            param.Add("@fromStatus", fromStatus);
            param.Add("@toStatus", toStatus);
            param.Add("@fromEventStatus", fromEventStatus);
            param.Add("@toEventStatus", toEventStatus);
            param.Add("@actionBy", buVO.ActionBy);
            return this.Execute("SP_DOC_UPDATE_STATUS_TO_CHILD",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
        }

        public List<SPOutDocItemCanMap> ListItemCanMap(string packCode, DocumentTypeID docTypeID, long? docID, string eventStatus, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("packCode", packCode);
            param.Add("docTypeID", docTypeID);
            param.Add("docID", docID);
            param.Add("eventStatus", eventStatus);
            var res = this.Query<SPOutDocItemCanMap>("SP_DOCITEM_LIST_CANMAP",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
    }
}

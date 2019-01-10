using AMWUtil.Common;
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


        public List<amt_DocumentItemStorageObject> ListStoInDocs(List<long> stoids, DocumentTypeID docTypeID, VOCriteria buVO)
        {
            return ListStoInDocs(null, stoids, docTypeID, buVO);
        }
        public List<amt_DocumentItemStorageObject> ListStoInDocs(long docID, VOCriteria buVO)
        {
            return ListStoInDocs(docID, null, null, buVO);
        }
        public List<amt_DocumentItemStorageObject> ListStoInDocs(long? docID, List<long> stoids, DocumentTypeID? docTypeID, VOCriteria buVO)
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
        public long? UpdateEventStatus(long id, DocumentEventStatus eventStatus, VOCriteria buVO)
        {
            var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(eventStatus);
            var res = DataADO.GetInstant().UpdateByID<amt_Document>(id, buVO,
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("EventStatus", eventStatus),
                    new KeyValuePair<string, object>("Status", status)
                });
            return res;
        }
        public long? UpdateItemEventStatus(long id, DocumentEventStatus eventStatus, VOCriteria buVO)
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
                param.Add("@status", StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(doc.EventStatus));
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
            param.Add("@baseQuantity", docItem.BaseQuantity);
            param.Add("@unitTypeID", docItem.UnitType_ID);
            param.Add("@baseUnitTypeID", docItem.BaseUnitType_ID);
            param.Add("@expireDate", docItem.ExpireDate);
            param.Add("@options", docItem.Options);
            param.Add("@productionDate", docItem.ProductionDate);
            param.Add("@ref1", docItem.Ref1);
            param.Add("@ref2", docItem.Ref2);
            param.Add("@refID", docItem.RefID);
            param.Add("@orderNo", docItem.OrderNo);
            param.Add("@batch", docItem.Batch);
            param.Add("@lot", docItem.Lot);
            param.Add("@eventStatus", docItem.EventStatus);
            param.Add("@status", StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(docItem.EventStatus));
            //param.Add("@storageObject_IDs", docItem.StorageObjectIDs == null ? null : string.Join(",", docItem.StorageObjectIDs));
            param.Add("@actionBy", buVO.ActionBy);

            //var docItemStos = docItem.DocItemStos;
            var docItemTmp = this.Query<amt_DocumentItem>("SP_DOCITEM_CREATE",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction)
                                .FirstOrDefault();

            docItem.ID = docItemTmp.ID;
            if (docItem.DocItemStos != null && docItem.DocItemStos.Count() > 0)
                docItem.DocItemStos.ForEach(x => { x.DocumentItem_ID = docItem.ID.Value; this.MappingSTO(x, buVO); });
            
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

        public int UpdateStatusMappingSTO(long id, EntityStatus status, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@id", id);
            param.Add("@status", status);
            param.Add("@actionBy", buVO.ActionBy);
            return this.Execute("SP_DOCITEM_MAP_STO_V2",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
        }
        public List<amt_DocumentItemStorageObject> MappingSTO(List<amt_DocumentItemStorageObject> docItemSto, VOCriteria buVO)
        {
            docItemSto.ForEach(x => MappingSTO(x, buVO));
            return docItemSto;
        }
        public amt_DocumentItemStorageObject MappingSTO(amt_DocumentItemStorageObject docItemSto, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@documentItemID", docItemSto.DocumentItem_ID);
            param.Add("@storageObjectID", docItemSto.StorageObject_ID);
            param.Add("@qty", docItemSto.Quantity);
            param.Add("@unitID", docItemSto.UnitType_ID);
            param.Add("@baseQty", docItemSto.BaseQuantity);
            param.Add("@baseUnitID", docItemSto.BaseUnitType_ID);
            param.Add("@actionBy", buVO.ActionBy);
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            this.Execute("SP_DOCITEM_MAP_STO_V2",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
            docItemSto.ID = param.Get<long>("@resID");
            return docItemSto;
        }

        public amt_Document Get(long docID, VOCriteria buVO)
        {
            var whares = new List<SQLConditionCriteria>();

            whares.Add(new SQLConditionCriteria("ID", docID, SQLOperatorType.EQUALS));
            whares.Add(new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN));

            var res = ADO.DataADO.GetInstant().SelectBy<amt_Document>(whares.ToArray(), buVO);
            return res.FirstOrDefault();
        }
        public List<amt_Document> List(List<long> docIDs, VOCriteria buVO)
        {
            var whares = new List<SQLConditionCriteria>();
            
            whares.Add(new SQLConditionCriteria("ID", string.Join(',', docIDs), SQLOperatorType.IN));
            whares.Add(new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN));

            var res = ADO.DataADO.GetInstant().SelectBy<amt_Document>(whares.ToArray(), buVO);
            return res;
        }

        public List<amt_Document> List(DocumentTypeID docTypeID, long? souWarehouseID, string orderNo, string batch, string lot, VOCriteria buVO)
        {
            var whares = new List<SQLConditionCriteria>();
            whares.Add(new SQLConditionCriteria("DocumentType_ID", docTypeID, SQLOperatorType.EQUALS));
            whares.Add(new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN));
            if (souWarehouseID.HasValue)
                whares.Add(new SQLConditionCriteria("Sou_Warehouse_ID", souWarehouseID, SQLOperatorType.EQUALS));
            if (!string.IsNullOrWhiteSpace(orderNo))
                whares.Add(new SQLConditionCriteria("OrderNo", orderNo, SQLOperatorType.EQUALS));
            if (!string.IsNullOrWhiteSpace(lot))
                whares.Add(new SQLConditionCriteria("Lot", lot, SQLOperatorType.EQUALS));
            if (!string.IsNullOrWhiteSpace(batch))
                whares.Add(new SQLConditionCriteria("Batch", batch, SQLOperatorType.EQUALS));

            var res = ADO.DataADO.GetInstant().SelectBy<amt_Document>(whares.ToArray(), buVO);
            return res;
        }

        public List<amt_DocumentItem> ListItem(DocumentTypeID docTypeID, long? packID,
            long? souWarehouseID, long? desWarehouseID,
            long? unitTypeID, long? baseUnitTypeID,
            string orderNo, string batch, string lot, VOCriteria buVO)
        {
            var whares = new List<SQLConditionCriteria>();
            whares.Add(new SQLConditionCriteria("DocumentType_ID", docTypeID, SQLOperatorType.EQUALS));
            whares.Add(new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN));
            if (souWarehouseID.HasValue)
                whares.Add(new SQLConditionCriteria("Sou_Warehouse_ID", souWarehouseID, SQLOperatorType.EQUALS));
            if (desWarehouseID.HasValue)
                whares.Add(new SQLConditionCriteria("Des_Warehouse_ID", desWarehouseID, SQLOperatorType.EQUALS));
            if (packID.HasValue)
                whares.Add(new SQLConditionCriteria("PackMaster_ID", packID, SQLOperatorType.EQUALS));
            if (!string.IsNullOrWhiteSpace(orderNo))
                whares.Add(new SQLConditionCriteria("OrderNo", orderNo, SQLOperatorType.EQUALS));
            if (!string.IsNullOrWhiteSpace(lot))
                whares.Add(new SQLConditionCriteria("Lot", lot, SQLOperatorType.EQUALS));
            if (!string.IsNullOrWhiteSpace(batch))
                whares.Add(new SQLConditionCriteria("Batch", batch, SQLOperatorType.EQUALS));
            if (unitTypeID.HasValue)
                whares.Add(new SQLConditionCriteria("UnitType_ID", unitTypeID, SQLOperatorType.EQUALS));
            if (baseUnitTypeID.HasValue)
                whares.Add(new SQLConditionCriteria("BaseUnitType_ID", baseUnitTypeID, SQLOperatorType.EQUALS));

            var res = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("amv_DocumentItem", "*", null, whares.ToArray(), null, null, null, buVO);
            return res;
        }
        public List<amt_DocumentItem> ListItem(long docID, VOCriteria buVO)
        {
            var whares = new List<SQLConditionCriteria>();
            whares.Add(new SQLConditionCriteria("Document_ID", docID, SQLOperatorType.EQUALS));
            whares.Add(new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN));

            var res = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(whares.ToArray(), buVO);
            return res;
        }
        public List<amt_DocumentItem> ListItemAndStoInDoc(long docID, VOCriteria buVO)
        {
            var res = this.ListItem(docID, buVO);
            var resSto = this.ListStoInDocs(docID, buVO);
            res.ForEach(x =>
            {
                x.DocItemStos = resSto.Where(y => y.DocumentItem_ID == x.ID).ToList();
            });
            return res;
        }
        public List<SPOutCountStoInDocItem> CountStoInDocItems(IEnumerable<long> docItemIDs, VOCriteria buVO)
        {
            var whares = new List<SQLConditionCriteria>();
            whares.Add(new SQLConditionCriteria("DocumentItem_ID", string.Join(',', docItemIDs.ToArray()), SQLOperatorType.IN));
            whares.Add(new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN));

            var res = ADO.DataADO.GetInstant().SelectBy<SPOutCountStoInDocItem>(
                "amt_DocumentItemStorageObject",
                "DocumentItem_ID,sum(BaseQuantity) BaseQuantity,BaseUnitType_ID",
                "DocumentItem_ID,BaseUnitType_ID",
                whares.ToArray(), null, null, null,
                buVO);
            return res;
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
        public List<amt_DocumentItem> ListItemCanMapV2(
            DocumentTypeID docTypeID, long? packID, decimal addBaseQty,
            long? souWarehouseID, long? desWarehouseID,
            long? unitTypeID, long? baseUnitTypeID,
            string orderNo, string batch, string lot, VOCriteria buVO)
        {
            var docItems = ADO.DocumentADO.GetInstant()
                       .ListItem(DocumentTypeID.GOODS_RECEIVED, packID, souWarehouseID, desWarehouseID, unitTypeID, baseUnitTypeID, orderNo, batch, lot, buVO);
                       //.Where(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.IDEL);

            List<amt_DocumentItem> res = new List<amt_DocumentItem>();
            var countStoInDocItems = ADO.DocumentADO.GetInstant().CountStoInDocItems(docItems.Select(x => x.ID.Value).ToList(), buVO);
            foreach (var di in docItems)
            {
                var countInDoc = countStoInDocItems.FirstOrDefault(x => x.DocumentItem_ID == di.ID);
                if (!di.BaseQuantity.HasValue)
                {
                    res.Add(di);
                }
                else if ((countInDoc == null ? 0 : countInDoc.BaseQuantity) + addBaseQty <= di.BaseQuantity.Value)
                {
                    res.Add(di);
                }
            }
            return res;
        }
        public List<SPOutDocItemCanMap> ListItemCanMap(string packCode, DocumentTypeID docTypeID, string batch, string lot, VOCriteria buVO)
        {
            return ListItemCanMap(packCode, docTypeID, batch, lot, null, null, buVO);
        }
        public List<SPOutDocItemCanMap> ListItemCanMap(string packCode, DocumentTypeID docTypeID, string batch, string lot,
            long? souWarehouseID,long? desWarehouseID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("packCode", packCode);
            param.Add("docTypeID", docTypeID);
            param.Add("batch", batch);
            param.Add("lot", lot);
            param.Add("souWarehouseID", souWarehouseID);
            param.Add("desWarehouseID", desWarehouseID);
            var res = this.Query<SPOutDocItemCanMap>("SP_DOCITEM_LIST_CANMAP",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public List<amt_DocumentItem> ListItemByWorkQueue(long workQueueID, VOCriteria buVO)
        {
            return this.ListItemByWorkQueue(new List<long> { workQueueID }, buVO);
        }
        public List<amt_DocumentItem> ListItemByWorkQueue(List<long> workQueueIDs, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("workQueueIDs", string.Join(",", workQueueIDs));
            var res = this.Query<amt_DocumentItem>("SP_DOCITEM_LIST_BYQUEUEID",
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

        public List<SPOutDocTargetCriteria> Target(long docID, DocumentTypeID docTypeID, VOCriteria buVO)
        {
            List<long> docIDs = new List<long>();
            docIDs.Add(docID);
            return this.Target(docIDs, docTypeID, buVO);
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

        public List<amt_Document> ListDocumentCanMap(string palletCode, StorageObjectEventStatus docTypeID, PickingModeType pickMode, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("palletCode", palletCode);
            param.Add("eventStatus", docTypeID);
            param.Add("modePick", pickMode);
            var res = this.Query<amt_Document>("SP_STO_SCAN_PALLET_FOR_PICKING",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

        public List<amt_Document> ListChildUnderParentLink(long childDocumentID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("childDocumentID", childDocumentID);
            var res = this.Query<amt_Document>("SP_DOC_LISTCHILD_UNDER_PARENTLINK",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

        //public List<amt_Document> ListParentLink(long childDocumentID, VOCriteria buVO)
        public List<amt_Document> ListDocumentCanAudit(string palletCode, StorageObjectEventStatus eventStatus, DocumentTypeID docTypeID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("palletCode", palletCode);
            param.Add("eventStatus", eventStatus);
            param.Add("docTypeID", docTypeID);
            var res = this.Query<amt_Document>("SP_STO_SCAN_PALLET_FOR_AUDIT",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

        public List<amt_Document> ListParentLink(long childDocumentID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("documentID", childDocumentID);
            var res = this.Query<amt_Document>("SP_DOC_LIST_PARENTLINK",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public List<amt_DocumentItem> ListItemParentLink(long childDocumentID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("documentID", childDocumentID);
            var res = this.Query<amt_DocumentItem>("SP_DOCITEM_LIST_PARENTLINK",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public amt_DocumentItem DocItemPut(amt_DocumentItem docItem, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@ID", docItem.ID);
            param.Add("@document_ID", docItem.Document_ID);
            param.Add("@linkDocumentID", docItem.LinkDocument_ID);
            param.Add("@packMaster_ID", docItem.PackMaster_ID);
            param.Add("@sku_ID", docItem.SKUMaster_ID);
            param.Add("@code", docItem.Code);
            param.Add("@quantity", docItem.Quantity);
            param.Add("@baseQuantity", docItem.BaseQuantity);
            param.Add("@unitTypeID", docItem.UnitType_ID);
            param.Add("@baseUnitTypeID", docItem.BaseUnitType_ID);
            param.Add("@expireDate", docItem.ExpireDate);
            param.Add("@options", docItem.Options);
            param.Add("@productionDate", docItem.ProductionDate);
            param.Add("@ref1", docItem.Ref1);
            param.Add("@ref2", docItem.Ref2);
            param.Add("@refID", docItem.RefID);
            param.Add("@orderNo", docItem.OrderNo);
            param.Add("@batch", docItem.Batch);
            param.Add("@lot", docItem.Lot);
            param.Add("@eventStatus", docItem.EventStatus);
            param.Add("@status", StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(docItem.EventStatus));           
            param.Add("@actionBy", buVO.ActionBy);


            var res = this.Query<amt_DocumentItem>("SP_DOCITEM_PUT",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).FirstOrDefault();
            docItem.ID = res.ID;
            docItem.Status = res.Status;
            return docItem;
        }

        public List<SPOutDocItemQueueProcess> ProcessQueueByDocItemID(long? docItemID, int pickOrderBy, string pickBy, string stampDate, string batch, string orderNo, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("DOCITEM_ID", docItemID);
            param.Add("PICK_ORDER_BY", pickOrderBy);
            param.Add("PICK_BY", pickBy);
            param.Add("STAMP_DATE", stampDate);
            param.Add("BATCH", batch);
            param.Add("ORDER_NO", orderNo);

            var res = this.Query<SPOutDocItemQueueProcess>("SP_DOCITEM_QUEUE_PROCESS",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

        public List<SPOutDocItemQueueProcess> ListAuditItem(long docItem, string lot, string batch, string order_no, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("DOCITEM_ID", docItem);
            param.Add("STAMP_DATE", lot);
            param.Add("BATCH", lot);
            param.Add("ORDER_NO", order_no);
            var res = this.Query<SPOutDocItemQueueProcess>("SP_DOCITEM_QUEUE_PROCESS_AUDIT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }

        public void CreateDocItemSto (long docItemID, long stoID, decimal qty, int unitTypeID, decimal baseQty, int baseUnitTypeID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("DOCITEM_ID", docItemID);
            param.Add("STO_ID", stoID);
            param.Add("QUANTITY", qty);
            param.Add("UNIT_TYPE_ID", unitTypeID);
            param.Add("BASE_QUANTITY", baseQty);
            param.Add("BASE_UNIT_TYPE_ID", baseUnitTypeID);
            param.Add("USER_ID", buVO.ActionBy);
            var stoids = this.Query<SPOutSTORootCanUseCriteria>("SP_DOCITEM_STO_CREATE", 
                System.Data.CommandType.StoredProcedure, 
                param, 
                buVO.Logger, 
                buVO.SqlTransaction);
        }

        public List<amt_Document> updateStatus(long? ID,EntityStatus tostatus, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("ID", ID);
            param.Add("tostatus", tostatus);

            var res = this.Query<amt_Document>("SP_DOC_UPDATESTATUS",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
    }
}

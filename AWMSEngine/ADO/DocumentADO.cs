using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class DocumentADO : ADO.BaseMSSQLAccess<DocumentADO>
    {
        public amt_Document Create(amt_Document doc, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@parentDocument_ID", doc.ParentDocument_ID);
            param.Add("@documentType_ID", doc.DocumentType_ID);
            param.Add("@dealer_ID", doc.Dealer_ID);

            param.Add("@sou_branch_ID", doc.Sou_Branch_ID);
            param.Add("@sou_warehouse_ID", doc.Sou_Warehouse_ID);
            param.Add("@sou_areaMaster_ID", doc.Sou_AreaMaster_ID);
            param.Add("@des_branch_ID", doc.Des_Branch_ID);
            param.Add("@des_warehouse_ID", doc.Des_Warehouse_ID);
            param.Add("@des_areaMaster_ID", doc.Des_AreaMaster_ID); 

            param.Add("@supplier_ID", doc.Supplier_ID);
            param.Add("@actionTime", doc.ActionTime);
            param.Add("@documentDate", doc.DocumentDate);
            param.Add("@options", doc.Options);
            param.Add("@ref1", doc.Ref1);
            param.Add("@ref2", doc.Ref2);
            param.Add("@ref3", doc.Ref3);
            param.Add("@remark", doc.Remark);
            param.Add("@eventStatus", 0);
            param.Add("@actionBy", buVO.ActionBy);
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            param.Add("@resCode", null, System.Data.DbType.String, System.Data.ParameterDirection.Output, 150);

            this.Execute("SP_DOC_CREATE",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
            var newid = param.Get<long>("@resID");
            var newcode = param.Get<string>("@resCode");

            doc.ID = newid;
            doc.Code = newcode;
            doc.CreateBy = buVO.ActionBy;
            doc.CreateTime = DateTime.Now;

            doc.DocumentItems.ForEach(x =>
            {
                x.Document_ID = doc.ID.Value;
                this.CreateItem(x, buVO);
            });

            return doc;

        }

        public int UpdateEventStatus(long id, DocumentEventStatus eventStatus, VOCriteria buVO)
        {
            var res = DataADO.GetInstant().UpdateByID<amt_Document>(id, buVO,
                new KeyValuePair<string, object>("EventStatus", eventStatus));
            return res;
        }

        public amt_DocumentItem CreateItem(amt_DocumentItem docItem, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@document_ID", docItem.Document_ID);
            param.Add("@packMaster_ID", docItem.PackMaster_ID);
            param.Add("@sku_ID", docItem.SKU_ID);
            param.Add("@code", docItem.Code);
            param.Add("@quantity", docItem.Quantity);
            param.Add("@expireDate", docItem.ExpireDate);
            param.Add("@options", docItem.Options);
            param.Add("@productionDate", docItem.ProductionDate);
            param.Add("@ref1", docItem.Ref1);
            param.Add("@ref2", docItem.Ref2);
            param.Add("@ref3", docItem.Ref3);
            param.Add("@eventStatus", 0);
            param.Add("@storageObject_IDs", string.Join(",", docItem.StorageObjectIDs));
            param.Add("@actionBy", buVO.ActionBy);
            param.Add("@resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);

            this.Execute("SP_DOCITEM_CREATE",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
            var newid = param.Get<long>("@resID");

            docItem.ID = newid;
            docItem.CreateBy = buVO.ActionBy;
            docItem.CreateTime = DateTime.Now;
            return docItem;
        }
        public int Close(long documentID, bool needClose, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@documentID", documentID);
            param.Add("@needClose", needClose);

            return this.Execute("SP_DOC_CLOSE",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction);
        }

        public int MappingSTO(long documentItemID, List<long> storageObjectIDs,VOCriteria buVO)
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
    }
}

using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amv_Document : IEntityModel
    {
        public long? ID;
        public string Code;
        public long? ParentDocument_ID;
        public long? DocumentType_ID;
        public long? Sou_Customer_ID;
        public string SouCustomer;
        public long? Sou_Supplier_ID;
        public string SouSupplier;
        public long? Sou_Branch_ID;
        public string SouBranch;
        public long? Transport_ID;
        public string Transport;
        public long? Sou_Warehouse_ID;
        public string SouWarehouse;
        public long? Sou_AreaMaster_ID;
        public string SouArea;
        public long? Des_Customer_ID;
        public string DesCustomer;
        public long? Des_Supplier_ID;
        public string DesSupplier;
        public long? Des_Branch_ID;
        public string DesBranch;
        public long? Des_Warehouse_ID;
        public string DesWarehouse;
        public long? Des_AreaMaster_ID;
        public string DesArea;
        public long? For_Customer_ID;
        public string ForCustomer;
        public string Batch;
        public string Lot;
        public string Options;
        public string Remark;
        public DateTime? ActionTime;
        public DateTime DocumentDate;
        public DocumentEventStatus EventStatus;
        public string RefID;
        public string Ref1;
        public string Ref2;
        public EntityStatus Status;
        public long CreateBy;
        public DateTime CreateTime;
        public long? ModifyBy;
        public DateTime? ModifyTime;
        public long? SouBranchID;
        public long? DesBranchID;
        public long? DocumentTypeID;
        public long? SouCusID;
        public long? DesCusID;
        public long? ForCusID;
        public long? SouSupID;
        public long? DesSupID;
        public long? SouWarID;
        public long? DesWarID;
        public long? SouAreaID;
        public long? DesAreaID;
        public DateTime? Created;
        public DateTime? Modified;
    }
}

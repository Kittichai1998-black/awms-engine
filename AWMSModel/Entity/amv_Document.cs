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
        public long? Sou_Supplier_ID;
        public long? Sou_Branch_ID;
        public long? Transport_ID;
        public long? Sou_Warehouse_ID;
        public long? Sou_AreaMaster_ID;
        public long? Des_Customer_ID;
        public long? Des_Supplier_ID;
        public long? Des_Branch_ID;
        public long? Des_Warehouse_ID;
        public long? Des_AreaMaster_ID;
        public long? For_Customer_ID;
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
        public string SouCustomer;
        public string SouSupplier;
        public string SouBranch;
        public string Transport;
        public string SouWarehouse;
        public string SouArea;
        public string DesCustomer;
        public string DesSupplier;
        public string DesBranch;
        public string DesWarehouse;
        public string DesArea;
        public string ForCustomer;

        public string SouCustomerName;
        public string SouSupplierName;
        public string SouBranchName;
        public string TransportName;
        public string SouWarehouseName;
        public string SouAreaName;
        public string DesCustomerName;
        public string DesSupplierName;
        public string DesBranchName;
        public string DesWarehouseName;
        public string DesAreaName;
        public string ForCustomerName;
        public string MovementName;

        public string Created;
        public string Modified;
    }
}

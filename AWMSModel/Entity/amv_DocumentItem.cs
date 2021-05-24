﻿using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amv_DocumentItem : IEntityModel
    {
        public long? ID;
        public DocumentTypeID DocumentType_ID;
        public DocumentProcessTypeID DocumentProcessType_ID;
        public long? ParentDocumentItem_ID;
        public long? Document_ID;
        public long? SKUMaster_ID;
        public long? PackMaster_ID;
        public string Code;
        public string BaseCode;
        public decimal? Quantity;
        public decimal? BaseQuantity;
        public string Options;
        public DateTime? ProductionDate;
        public AuditStatus AuditStatus;
        public DateTime? ExpireDate;
        public string RefID;
        public string Ref1;
        public string Ref2;
        public string Ref3;
        public string Ref4;
        public DocumentEventStatus EventStatus;
        public EntityStatus Status;
        public long CreateBy;
        public DateTime CreateTime;
        public long? ModifyBy;
        public DateTime ModifyTime;
        public string Document_Code;
        public string SKUMaster_Code;
        public string CartonNo;
        public string SKUMaster_Name;
        public string SKUMasterTypeName;
        public string PackMaster_Code;
        public string PackMaster_Name;

        public long? UnitType_ID;
        public long? IncubationDay;
        public long? ShelfLifeDay;
        public string UnitType_Code;
        public string UnitType_Name;
        public long? BaseUnitType_ID;
        public string BaseUnitType_Code;
        public string BaseUnitType_Name;

        public string Batch;
        public string Lot;
        public string ItemNo;
        public string OrderNo;
        //public string SKUMaster_Info1;
        public string PackMaster_Volume;
        public string Quantity_Genarate;
        public string DesCustomer;
        public string DesCustomerName;

        public decimal Volume;
        public decimal MinInnerVolume;
        public decimal MaxInnerVolume;




    }
}

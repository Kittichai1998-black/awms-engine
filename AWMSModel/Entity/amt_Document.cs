using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amt_Document : Entity.BaseEntityCreateModify
    {
        public string Code;
        public DocumentTypeID DocumentType_ID;

        public long? ParentDocument_ID;

        public long? Sou_Customer_ID;
        public long? Sou_Supplier_ID;
        public long? Sou_Branch_ID;
        public long? Sou_Warehouse_ID;
        public long? Sou_AreaMaster_ID;
        public long? Sou_AreaLocationMaster_ID;

        public long? Des_Customer_ID;
        public long? Des_Supplier_ID;
        public long? Des_Branch_ID;
        public long? Des_Warehouse_ID;
        public long? Des_AreaMaster_ID;
        public long? Des_AreaLocationMaster_ID;

        public long? Transport_ID;
        public DocumentProcessTypeID DocumentProcessType_ID;

        public string Options;
        public string Remark;
        public DateTime? ActionTime;
        public DateTime DocumentDate;
        public string RefID;
        public string Ref1;
        public string Ref2;
        public string Ref3;
        public string Ref4;

        public long? Wave_ID;
        public long? For_Customer_ID;
        public int? ProductOwner_ID;


        public DocumentEventStatus EventStatus;

        [FieldAttribute(IsDbField = false)]
        public amt_Document ParentDocument;

        [FieldAttribute(IsDbField = false)]
        public List<amt_DocumentItem> DocumentItems;

        [FieldAttribute(IsDbField = false)]
        public List<amt_Document> DocumetnChilds;
    }
}

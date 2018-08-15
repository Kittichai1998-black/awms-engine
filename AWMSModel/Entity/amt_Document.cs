using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_Document : Entity.BaseEntityCreateModify
    {
        public string Code;
        public DocumentTypeID DocumentType_ID;

        public long? ParentDocument_ID;

        public long? Sou_Dealer_ID;
        public long? Sou_Supplier_ID;
        public long? Sou_Branch_ID;
        public long? Sou_Warehouse_ID;
        public long? Sou_AreaMaster_ID;

        public long? Des_Dealer_ID;
        public long? Des_Supplier_ID;
        public long? Des_Branch_ID;
        public long? Des_Warehouse_ID;
        public long? Des_AreaMaster_ID;

        public string TransportNo;

        public string Options;
        public string Remark;
        public DateTime? ActionTime;
        public DateTime DocumentDate;
        public string RefID;
        public string Ref1;
        public string Ref2;

        public int? For_Supplier_ID;
        public string Barch;
        public string Lot;

        public DocumentEventStatus EventStatus;

        public List<amt_DocumentItem> DocumentItems;
        public List<amt_Document> DocumetnChilds;
    }
}

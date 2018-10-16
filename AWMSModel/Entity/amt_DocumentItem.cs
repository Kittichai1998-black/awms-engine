using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_DocumentItem : Entity.BaseEntityCreateModify
    {
        public long Document_ID;
        public long? LinkDocument_ID;
        public string Code;
        public long? SKUMaster_ID;
        public long? PackMaster_ID;
        public int? Quantity;
        public string Options;
        public DateTime? ProductionDate;
        public DateTime? ExpireDate;
        public string Ref1;
        public string Ref2;
        public string Ref3;
        public DocumentEventStatus EventStatus;

        public List<long> StorageObjectIDs;
    }
}

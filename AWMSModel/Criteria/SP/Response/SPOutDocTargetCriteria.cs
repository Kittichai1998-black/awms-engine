using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutDocTargetCriteria
    {
        public long documentID;
        public string documentCode;

        public long skuMasterID;
        public string skuMasterCode;
        public string skuUnitTypeCode;

        public long packMasterID;
        public string packMasterCode;
        public string packUnitTypeCode;

        public int lockedPackQty;
        public int needPackQty;
        public int targetPackQty;

        public DocumentEventStatus eventStatus;
        public EntityStatus status;
    }
}

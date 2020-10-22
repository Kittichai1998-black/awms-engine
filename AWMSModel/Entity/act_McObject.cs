using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class act_McObject : BaseEntityCreateModify
    {
        public string Code;
        public int McPosition_ID;
        public int McMaster_ID;
        public long McMoveStage;
        public long StoMoveStage;
    }
}

using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amt_Wave : BaseEntitySTD
    {
        public IOType IOType;
        //public long Document_ID;
        public WaveRunMode RunMode;
        public long Des_Area_ID;
        public DateTime? RunScheduleTime;
        public int Priority;
        public DateTime? StartTime;
        public DateTime? EndTime;
        public WaveEventStatus EventStatus;

        public List<amt_WaveSeq> WaveSeqs;
    }
}

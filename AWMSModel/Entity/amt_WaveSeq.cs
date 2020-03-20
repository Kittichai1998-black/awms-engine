﻿using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_WaveSeq : BaseEntitySTD
    {
        public long Wave_ID;
        public int Seq;
        public StorageObjectEventStatus Start_StorageObject_EventStatus;
        public StorageObjectEventStatus End_StorageObject_EventStatus;
        public bool AutoNextSeq;
        public DateTime? StartTime;
        public DateTime? EndTime;
        public WaveEventStatus EventStatus;
    }
}

using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_WaveSeqTemplate : BaseEntitySTD
    {
        public DocumentProcessTypeID DocumentProcessType_ID;
        public int Seq;
        public StorageObjectEventStatus Start_StorageObject_EventStatus;
        public StorageObjectEventStatus End_StorageObject_EventStatus;
        public bool AutoNextSeq;
        public bool AutoDoneSeq;
        public bool WCSDone;
        public DateTime? StartTime;
        public DateTime? EndTime;
        public WaveEventStatus EventStatus;
    }
}

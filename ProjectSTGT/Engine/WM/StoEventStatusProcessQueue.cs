using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTGT.Engine.WM
{
    public class StoEventStatusProcessQueue : IProjectEngine<amt_Document, ProcessQueueDoneStatus>
    {
        public ProcessQueueDoneStatus ExecuteEngine(AMWLogger logger, VOCriteria buVO, amt_Document reqVO)
        {
            var eventStatus = new ProcessQueueDoneStatus();

            eventStatus.stoDoneSouEventStatus = StorageObjectEventStatus.PARTIAL;
            eventStatus.stoDoneDesEventStatus = StorageObjectEventStatus.PICKED;

            return eventStatus;
        }
    }
}

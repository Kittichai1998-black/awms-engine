using AWMSEngine.Engine.V2.Notification;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ScheduleService.DailyMaintenance
{
    public class DailyNotifyMaintenance : BaseNotification
    {
        protected override string GetCode(dynamic reqVO)
        {
            throw new NotImplementedException();
        }

        protected override string GetMessageAMS(dynamic reqVO, dynamic data)
        {
            throw new NotImplementedException();
        }

        protected override EmailFormat GetMessageEmail(dynamic reqVO, dynamic data)
        {
            throw new NotImplementedException();
        }

        protected override string GetMessageFacebook(dynamic reqVO, dynamic data)
        {
            throw new NotImplementedException();
        }

        protected override string GetMessageLine(dynamic reqVO, dynamic data)
        {
            throw new NotImplementedException();
        }

        protected override NotifyData LoadData(dynamic reqVO)
        {
            throw new NotImplementedException();
        }
    }
}

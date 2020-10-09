using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using OfficeOpenXml;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Information;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Notification
{
    public class GetNotify : BaseEngine<GetNotify.TReq, GetNotify.TRes>
    {
        public class TReq
        {
            public int userId;
            public long sk;
            public int l = 0;
            public string filter;
        }

        public class TRes
        {
            public long userId;
            public List<SPOutNotify> messageDetails;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var noti = ADO.WMSDB.NotificationADO.GetInstant().GetNotifyPostByUserID(reqVO.userId, reqVO.l, reqVO.sk, reqVO.filter, this.BuVO);
            var res = new TRes();
            res.userId = reqVO.userId;
            res.messageDetails = noti;
            return res;
        }
    }
}

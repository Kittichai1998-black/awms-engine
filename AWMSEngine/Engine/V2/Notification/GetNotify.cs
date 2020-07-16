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
            public int l;
        }

        public class TRes
        {
            public long userId;
            public List<MessageDetail> messageDetails;
            public class MessageDetail
            {
                public long postID;
                public string message;
                public string subject;
                public DateTime datetime;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var noti = ADO.NotificationADO.GetInstant().GetNotifyPostByUserID(reqVO.userId, reqVO.l, reqVO.sk, this.BuVO);
            var res = new TRes();
            res.userId = reqVO.userId;
            var messageDetails = new List<TRes.MessageDetail>();
            noti.ForEach(x =>
            {
                messageDetails.Add(new TRes.MessageDetail()
                {
                    postID = x.ID.Value,
                    subject = x.Title,
                    message = x.Message,
                    datetime = x.CreateTime
                });
            });

            res.messageDetails = messageDetails;
            return res;
        }
    }
}

using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Linq;

namespace AWMSEngine.Engine.V2.Notification
{
    public abstract class BaseNotification : BaseEngine<dynamic, dynamic>
    {
        public class EmailFormat
        {
            public string Subject;
            public string Body;
        }
        public class NotifyData
        {
            public string Subject;
            public dynamic Body;
            public string Signature;
            public string Tag1;
            public string Tag2;
        }


        protected abstract string GetCode();
        protected abstract NotifyData LoadData(dynamic reqVO);
        protected abstract EmailFormat GetMessageEmail(dynamic reqVO,dynamic data);
        protected abstract string GetMessageLine(dynamic reqVO, dynamic data);
        protected abstract string GetMessageFacebook(dynamic reqVO, dynamic data);
        protected abstract string GetMessageAMS(dynamic reqVO, dynamic data);

        protected override dynamic ExecuteEngine(dynamic reqVO)
        {
            NotifyData data = LoadData(reqVO);
            EmailFormat sendEmail = GetMessageEmail(reqVO, data);
            string sendLine = GetMessageLine(reqVO, data);
            string sendFacebook = GetMessageFacebook(reqVO, data);
            var codeNotification = this.GetCode();

            var noti = ADO.NotificationADO.GetInstant().Get(codeNotification, this.BuVO);
            var userIDs = noti.notifyUsers.Select(x => x.User_ID).ToArray();
            var user = ADO.DataADO.GetInstant().SelectBy<ams_User>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("ID", string.Join(',', userIDs), SQLOperatorType.IN)
            }, BuVO);

            var groupEmail = noti.notifyUsers.GroupBy(x => x.IsSendToEmail).Select(x => new { x.Key, userIDs = x.ToList().Select(y => y.User_ID).ToList() }).ToList().FindAll(x => x.Key == true).FirstOrDefault();
            var groupLine = noti.notifyUsers.GroupBy(x => x.IsSendToLine).Select(x => new { x.Key, userIDs = x.ToList().Select(y => y.User_ID).ToList() }).ToList().FindAll(x => x.Key == true).FirstOrDefault();
            var groupFacebook = noti.notifyUsers.GroupBy(x => x.IsSendToFacebook).Select(x => new { x.Key, userIDs = x.ToList().Select(y => y.User_ID).ToList() }).ToList().FindAll(x => x.Key == true).FirstOrDefault();
            var groupAMS = noti.notifyUsers.GroupBy(x => x.IsSendToAMS).Select(x => new { x.Key, userIDs = x.ToList().Select(y => y.User_ID).ToList() }).ToList().FindAll(x => x.Key == true).FirstOrDefault();

            ADO.NotificationADO.GetInstant().InsertNotifyPost(
                new amt_NotifyPost()
                {
                    ID=null,
                    Notify_ID = noti.ID.Value,
                    Title = data.Subject,
                    Message = AMWUtil.Common.ObjectUtil.Json(data.Body),
                    PostTime = DateTime.Now,
                    Status = EntityStatus.ACTIVE,
                    Tag1 = data.Tag1,
                    Tag2 = data.Tag2,
                }, this.BuVO);

            if (groupEmail != null)
            {
                if (groupEmail.userIDs.Count > 0)
                {
                    var emailData = new AMWUtil.DataAccess.Http.EmailNotification.TReq()
                    {
                        emailAccess = new AMWUtil.DataAccess.Http.EmailNotification.TReq.EmailAccess()
                        {
                            Email = StaticValue.GetConfigValue(ConfigCode.Noti_Email_Sender),
                            Password = StaticValue.GetConfigValue(ConfigCode.Noti_Email_Sender_Password),
                            Port = StaticValue.GetConfigValue(ConfigCode.Noti_Email_SMTP_Port),
                            Host = StaticValue.GetConfigValue(ConfigCode.Noti_Email_SMTP_Host)
                        },
                        emailFormat = new AMWUtil.DataAccess.Http.EmailNotification.TReq.EmailFormat()
                        {
                            Subject = sendEmail.Subject,
                            Body = sendEmail.Body
                        },
                        receiverEmails = user.Select(x => x.EmailAddress).Distinct().ToList()
                    };

                    AMWUtil.DataAccess.Http.EmailNotification.SendEmail(emailData, this.Logger);
                }
                    
            }
            if (groupLine != null)
            {
                if(groupLine.userIDs.Count > 0)
                    user.Select(x => x.EmailAddress).Distinct().ToList().ForEach(x => {AMWUtil.DataAccess.Http.LineAccess.Notify(this.Logger, x, sendLine);});
            }
            if (groupFacebook != null)
            {
                if (groupFacebook.userIDs.Count > 0)
                {

                }
            }
            return data;
        }
    }
}

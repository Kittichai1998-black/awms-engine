using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class NotificationADO : BaseMSSQLAccess<NotificationADO>
    {
        public ams_Notify Get(int id, VOCriteria buVO)
        {
            var noti = DataADO.GetInstant().SelectByID<ams_Notify>(id, buVO);
            noti.notifyUsers = DataADO.GetInstant().SelectBy<ams_Notify_User>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("Notify_ID", noti.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return noti;
        }
        public ams_Notify Get(string code, VOCriteria buVO)
        {
            var noti = DataADO.GetInstant().SelectByCodeActive<ams_Notify>(code, buVO);
            noti.notifyUsers = DataADO.GetInstant().SelectBy<ams_Notify_User>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("Notify_ID", noti.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, buVO);
            return noti;
        }

        public ams_Notify_User GetNotifyUser(int id, VOCriteria buVO)
        {
            var notiUser = DataADO.GetInstant().SelectByID<ams_Notify_User>(id, buVO);
            return notiUser;
        }

        public amt_NotifyPost InsertNotifyPost(amt_NotifyPost notifyPost, VOCriteria buVO)
        {
            var notiUser = DataADO.GetInstant().Insert<amt_NotifyPost>(buVO, notifyPost);
            notifyPost.ID = notiUser;
            return notifyPost;
        }

        public amt_NotifyPost GetNotifyPost(int id, VOCriteria buVO)
        {
            var notiPost = DataADO.GetInstant().SelectByID<amt_NotifyPost>(id, buVO);
            return notiPost;
        }
        public List<amt_NotifyPost> GetNotifyPostByNotiftID(int notifyID, VOCriteria buVO)
        {
            var notiPost = DataADO.GetInstant().SelectBy<amt_NotifyPost>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("Notify_ID", notifyID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.NOTEQUALS)
                }, buVO);
            return notiPost;
        }
        public List<SPOutNotify> GetNotifyPostByUserID(int userId, int? limit, long? skip, string filter, VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("userId", userId);
            param.Add("l", limit);
            param.Add("sk", skip);
            param.Add("filter", filter);
            var notiPost = DataADO.GetInstant().QuerySP<SPOutNotify>("SP_GET_NOTIFY", param, buVO);
            return notiPost;
        }
    }
}

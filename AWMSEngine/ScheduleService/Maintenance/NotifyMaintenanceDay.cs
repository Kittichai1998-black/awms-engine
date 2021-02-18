using AWMSEngine.Engine.V2.Notification;
using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.ScheduleService.Maintenance
{
    public class NotifyMaintenanceDay : BaseNotification
    {
        protected override string GetCode(dynamic reqVO)
        {
            return reqVO.Code;
        }

        protected override string GetMessageAMS(dynamic reqVO, dynamic data)
        {
            return null;
        }

        protected override EmailFormat GetMessageEmail(dynamic reqVO, dynamic data)
        {
            string msg = GetMessage(data.Message, NotifyPlatform.Email);
            var res = new EmailFormat()
            {
                Body = msg,
                Subject = "Today Maintenance Plan"
            };
            return res;
        }

        protected override string GetMessageFacebook(dynamic reqVO, dynamic data)
        {
            return null;
        }

        protected override string GetMessageLine(dynamic reqVO, dynamic data)
        {
            string msg = GetMessage(data.Message, NotifyPlatform.Line);
            return msg;
        }

        protected override NotifyData LoadData(dynamic reqVO)
        {
            string title = reqVO.Title;
            dynamic msg = reqVO.Message;
            string sign = reqVO.Signature;
            string tag1 = reqVO.Tag1;
            string tag2 = reqVO.Tag2;

            var res = new NotifyData();
            res.Title = title;
            res.Message = msg;
            res.Signature = sign;
            res.Tag1 = tag1;
            res.Tag2 = tag2;
            return res;
        }

        private string GetMessage(dynamic message, NotifyPlatform notifySend)
        {
            List<MaintenanceDay.TRes> maintenance = AMWUtil.Common.ObjectUtil.DynamicToModel<List<MaintenanceDay.TRes>>(message);

            var strBody = new StringBuilder();

            if (notifySend == NotifyPlatform.Line)
            {
                int i = 1;
                strBody.Append("").AppendLine();
                maintenance.ForEach(x =>
                {
                    strBody.Append($"{i}) {x.Name} | Date : {x.NextDateMaintenance}").AppendLine();
                    i++;
                });
            }
            else
            {
                int i = 1;
                strBody.Append("<html>");
                strBody.Append("<body>");
                strBody.Append("<table style=\"border:1px solid black; border-collapse: collapse;\">");
                strBody.Append("<tr>");
                strBody.Append("<th style=\"border:1px solid black; \">No.</th>");
                strBody.Append("<th style=\"border:1px solid black; \">Name</th>");
                strBody.Append("<th style=\"border:1px solid black; \">Description</th>");
                strBody.Append("<th style=\"border:1px solid black; \">Date</th>");
                strBody.Append("<th style=\"border:1px solid black; \">Warehouse</th>");
                strBody.Append("</tr>");
                maintenance.ForEach(x =>
                {
                    strBody.Append("<tr>");
                    strBody.Append("<td style=\"border:1px solid black\">" + i + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Name + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Description + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.NextDateMaintenance + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Warehouse_Name + "</td>");
                    strBody.Append("</tr>");
                    i++;
                });
                strBody.Append("</table>");
                strBody.Append("</body>");
                strBody.Append("</html>");
            }

            return strBody.ToString();
        }
    }
}

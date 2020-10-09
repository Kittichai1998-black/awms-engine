using AWMSEngine.Engine.V2.Notification;
using AWMSModel.Constant.EnumConst;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBOSS.Engine.Notification
{
    public class CountingNotify : BaseNotification
    {
        public class TReq
        {
            public string code;
            public string docID;
            public string data;
        }

        protected override string GetCode(dynamic reqVO)
        {
            string NotifyCode = reqVO.Code;
            return NotifyCode;
        }

        protected override string GetMessageAMS(dynamic reqVO, dynamic data)
        {
            return "";
        }

        protected override EmailFormat GetMessageEmail(dynamic reqVO, dynamic data)
        {
            string msg = this.GetMessage(data.Message, NotifyPlatform.Email);

            var res = new EmailFormat();
            res.Subject = data.Title;
            res.Body = msg;
            return res;
        }

        protected override string GetMessageFacebook(dynamic reqVO, dynamic data)
        {
            return "";
        }

        protected override string GetMessageLine(dynamic reqVO, dynamic data)
        {
            return "";
        }

        protected override NotifyData LoadData(dynamic reqVO)
        {

            string title = reqVO.Title;
            List<SendNotify.STOResponse> msg = AMWUtil.Common.ObjectUtil.DynamicToModel<List<SendNotify.STOResponse>>(reqVO.Message);
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
            List<SendNotify.STOResponse> stoList = message;

            var strBody = new StringBuilder();

            if (notifySend == NotifyPlatform.Line)
            {
                int i = 1;
                strBody.Append("").AppendLine();
                stoList.ForEach(x =>
                {
                    string resStr = string.Format("{0}) {1}-> {2}:{3} {4} {5} OldWeight:{6} Weight:{7}", i, x.BaseCode, x.Code, x.Name, x.Quantity, x.UnitType, x.OldWeight, x.Weight);
                    strBody.Append(resStr).AppendLine();
                    strBody.Append("------------------------------").AppendLine();
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
                strBody.Append("<th style=\"border:1px solid black; \">Row</th>");
                strBody.Append("<th style=\"border:1px solid black; \">Pallet Code</th>");
                strBody.Append("<th style=\"border:1px solid black\">Code</th>");
                strBody.Append("<th style=\"border:1px solid black\">Name</th>");
                strBody.Append("<th style=\"border:1px solid black\">Quantity</th>");
                strBody.Append("<th style=\"border:1px solid black\">Unit</th>");
                strBody.Append("<th style=\"border:1px solid black\">Old Weight</th>");
                strBody.Append("<th style=\"border:1px solid black\">Weight</th>");
                strBody.Append("<th style=\"border:1px solid black\">Counting Status</th>");
                strBody.Append("</tr>");
                stoList.ForEach(x =>
                {
                    strBody.Append("<tr>");
                    strBody.Append("<td style=\"border:1px solid black\">" + i + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.BaseCode + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Code + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Name + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Quantity + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.UnitType + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.OldWeight + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Weight + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.AuditStatus + "</td>");
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

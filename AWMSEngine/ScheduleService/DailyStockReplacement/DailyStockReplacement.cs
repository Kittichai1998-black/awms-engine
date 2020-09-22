using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Notification;
using AWMSModel.Constant.EnumConst;
using Microsoft.CodeAnalysis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using ThoughtWorks.QRCode.Codec.Ecc;

namespace AWMSEngine.ScheduleService.DailyStockReplacement
{
    public class DailyStockReplacement : BaseNotification
    {
        public class DailyReport
        {
            public string Code;
            public string UnitType;
            public decimal MinQuantity;
            public decimal MaxQuantity;
            public string TotalQuantity;
            public bool MinQtyStatus;
            public bool MaxQtyStatus;
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
            string msg = this.GetMessage(data.Message, NotifyPlatform.Line);
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
            List<DailyReport> dailyDatas = AMWUtil.Common.ObjectUtil.DynamicToModel<List<DailyReport>>(message);

            var strBody = new StringBuilder();

            if(notifySend == NotifyPlatform.Line)
            {
                int i = 1;
                strBody.Append("").AppendLine();
                dailyDatas.ForEach(x =>
                {
                    strBody.Append(i + ") สินค้า" + x.Code + " จำนวนในคลัง" + x.TotalQuantity + " " + x.UnitType + " จำนวนขั้นต่ำ : " + x.MinQuantity).AppendLine();
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
                strBody.Append("<th style=\"border:1px solid black; \">Code</th>");
                strBody.Append("<th style=\"border:1px solid black\">TotalQuantity</th>");
                strBody.Append("<th style=\"border:1px solid black\">MinQuantity</th>");
                strBody.Append("<th style=\"border:1px solid black\">Unit</th>");
                strBody.Append("</tr>");
                dailyDatas.ForEach(x =>
                {
                    strBody.Append("<tr>");
                    strBody.Append("<td style=\"border:1px solid black\">" + i + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Code +"</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.TotalQuantity + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.MinQuantity + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.UnitType + "</td>");
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

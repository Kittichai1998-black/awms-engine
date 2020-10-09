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

namespace AWMSEngine.ScheduleService.DailyStockTransaction
{
    public class DailyStockReplacement : BaseNotification
    {
        public class DailyReport
        {
            public string pstoCode;
            public string pstoName;
            public string pstoBatch;
            public string pstoLot;
            public string pstoOrderNo;
            public decimal qty;
            public string unitType;
            public decimal baseQty;
            public string baseUnitType;
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

            var groupDailyData = dailyDatas.GroupBy(data => data.pstoCode).Select(data => new {
                code = data.Key,
                name = data.FirstOrDefault().pstoName,
                sumQty = data.Sum(x => x.baseQty),
                unit = data.FirstOrDefault().baseUnitType
            }).ToList();

            var strBody = new StringBuilder();

            if(notifySend == NotifyPlatform.Line)
            {
                int i = 1;
                strBody.Append("").AppendLine();
                groupDailyData.ForEach(x =>
                {
                    strBody.Append(i + ") " + x.code + " : " + x.name + " = " + x.sumQty + " " + x.unit).AppendLine();
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
                strBody.Append("<th style=\"border:1px solid black\">Name</th>");
                strBody.Append("<th style=\"border:1px solid black\">Quantity</th>");
                strBody.Append("<th style=\"border:1px solid black\">Unit</th>");
                strBody.Append("</tr>");
                groupDailyData.ForEach(x =>
                {
                    strBody.Append("<tr>");
                    strBody.Append("<td style=\"border:1px solid black\">" + i + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.code +"</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.name + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.sumQty + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.unit + "</td>");
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

using AWMSEngine.Engine.V2.Notification;
using AWMSModel.Constant.EnumConst;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBOSS.Engine.Audit
{
    public class AuditNotofy : BaseNotification
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
            List<AuditNotify.STOSendEmail> msg = AMWUtil.Common.ObjectUtil.DynamicToModel<List<AuditNotify.STOSendEmail>>(reqVO.Message);
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
            List<AuditNotify.STOSendEmail> stoList = message;

            var strBody = new StringBuilder();

            if (notifySend == NotifyPlatform.Line)
            {
                int i = 1;
                strBody.Append("").AppendLine();
                stoList.ForEach(x =>
                {
                    string resStr = string.Format("{0}) Pallet:{1}-> Pack:{2} Lot:{3}  VendorLot:{4} ControlNo:{5} ProductDate:{6} ExpiryDate{7} Status:{8} OldStatus:{9}", 
                        i, 
                        x.BaseCode, 
                        x.PackName,
                        x.Lot, 
                        x.VendorLot, 
                        x.ControlNo, 
                        x.ProductDate,
                        x.ExpiryDate,
                        x.Status,
                        x.OldStatus);
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
                strBody.Append("<th style=\"border:1px solid black\">Pack Name</th>");
                strBody.Append("<th style=\"border:1px solid black\">Lot</th>");
                strBody.Append("<th style=\"border:1px solid black\">Vendor Lot</th>");
                strBody.Append("<th style=\"border:1px solid black\">Product Date</th>");
                strBody.Append("<th style=\"border:1px solid black\">Expiry Date</th>");
                strBody.Append("<th style=\"border:1px solid black\">Status</th>");
                strBody.Append("<th style=\"border:1px solid black\">Old Status</th>");
                strBody.Append("</tr>");
                stoList.ForEach(x =>
                {
                    strBody.Append("<tr>");
                    strBody.Append("<td style=\"border:1px solid black\">" + i + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.BaseCode + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.PackName + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Lot + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.VendorLot + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.ControlNo + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.ProductDate + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.ExpiryDate + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.Status + "</td>");
                    strBody.Append("<td style=\"border:1px solid black\">" + x.OldStatus + "</td>");
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

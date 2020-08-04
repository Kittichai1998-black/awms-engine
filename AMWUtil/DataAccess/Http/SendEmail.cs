using AMWUtil.Exception;
using AMWUtil.Logger;
using Novell.Directory.Ldap;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;

namespace AMWUtil.DataAccess.Http
{
    public static class EmailNotification
    {
        public class TReq
        {
            public EmailFormat emailFormat;
            public EmailAccess emailAccess;
            public List<string> receiverEmails;

            public class EmailFormat
            {
                public string Subject;
                public string Body;
            }
            public class EmailAccess
            {
                public string Email;
                public string Password;
                public string Port;
                public string Host;
            }
        }
        public static string SendEmail(TReq reqVO, AMWLogger logger)
        {
            var email = reqVO.emailAccess.Email;
            var pass = reqVO.emailAccess.Password;
            var port = reqVO.emailAccess.Port;
            var host = reqVO.emailAccess.Host;
            try
            {
                using (MailMessage mail = new MailMessage())
                {
                    mail.From = new MailAddress(email);
                    reqVO.receiverEmails.ForEach(email =>
                    {
                        mail.To.Add(email);
                    });
                    mail.Subject = reqVO.emailFormat.Subject;
                    mail.Body = reqVO.emailFormat.Body;
                    mail.IsBodyHtml = true;

                    using SmtpClient smtp = new SmtpClient()
                    {
                        Host = host,
                        Port = Convert.ToInt32(port),
                        DeliveryMethod = SmtpDeliveryMethod.Network,
                        UseDefaultCredentials = false,
                        Credentials = new System.Net.NetworkCredential(email, pass),
                        EnableSsl = true,
                    };

                    smtp.Send(mail);
                }
                return "Send Success";
            }
            catch
            {
                throw new AMWException(logger, AMWExceptionCode.B0001, "Cannot Send Email");
            }
        }
    }
}

using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using Newtonsoft.Json;

namespace ProjectMRK.Engine.Bussiness
{
    public class ReadFileXML : BaseEngine<string, string>
    {
        protected override string ExecuteEngine(string reqVO)
        {
            FtpWebRequest fwr = (FtpWebRequest)WebRequest.Create("ftp://191.20.80.120:8089/MRK/recieved/");
            fwr.Credentials = new NetworkCredential("administrator", "amwteam");
            fwr.UseBinary = true;
            fwr.Method = WebRequestMethods.Ftp.DownloadFile;
            FtpWebResponse response = (FtpWebResponse)fwr.GetResponse();
            Stream s = response.GetResponseStream();

            StreamReader reader = new StreamReader(s);

            string x = reader.ReadToEnd();

            XmlDocument xml = new XmlDocument();

            xml.Load(s);

            return "";
        }

        public void test()
        {
            FtpWebRequest fwr = (FtpWebRequest)WebRequest.Create("ftp://191.20.80.120:8089/MRK/recieved/");
            fwr.Credentials = new NetworkCredential("administrator", "amwteam");
            fwr.Method = WebRequestMethods.Ftp.ListDirectory;
            fwr.UseBinary = true;
            FtpWebResponse response = (FtpWebResponse)fwr.GetResponse();
            Stream responseStream = response.GetResponseStream();
            StreamReader reader = new StreamReader(responseStream);
            string names = reader.ReadToEnd();
            reader.Close();
            response.Close();
            var xx = names.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries).ToList();
            Regex matchExpression = new Regex("^[a-zA-Z0-9].+\\.xml$", RegexOptions.IgnoreCase);
            var tt = xx.Where(x => matchExpression.Match(x).Success).ToList();

            if(tt.Count > 0)
            {
                tt.ForEach(x =>
                {
                    ReadListFileXML(x);
                });
            }
            else
            {
                Console.Write("No File");
            }
        }

        private void ReadListFileXML(string xmlname)
        {
            var request = (FtpWebRequest)WebRequest.Create("ftp://191.20.80.120:8089/MRK/recieved/" + xmlname);
            request.Credentials = new NetworkCredential("administrator", "amwteam");
            request.Method = WebRequestMethods.Ftp.DownloadFile;

            FtpWebResponse response = (FtpWebResponse)request.GetResponse();

            Stream responseStream = response.GetResponseStream();
            StreamReader reader = new StreamReader(responseStream);
            var xmlData = reader.ReadToEnd();
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(xmlData);
            var json = JsonConvert.SerializeXmlNode(doc);

            Console.WriteLine("Download Complete, status {0}", response.StatusDescription);

            reader.Close();
            reader.Dispose();
            response.Close();
        }
    }
}

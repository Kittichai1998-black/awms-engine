using System;
using System.IO;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;

namespace RemoteFile
{
    class Program
    {
        static void Main(string[] args)
        {
            //\\191.20.80.120\TestReadFile\
            Program prg = new Program();
            Console.WriteLine("Select Mode [1 = Shared Folder, 2 = FTP] : ");
            string mode = Console.ReadLine();
            string desPath = ConfigurationManager.AppSettings["localPath"];
            Console.WriteLine("Destination Folder Path : {0}", desPath);

            if (mode == "1")
            {
                string souPath = ConfigurationManager.AppSettings["sharedPath"];
                Console.WriteLine("Shared Folder Path : {0}", souPath);

                if (souPath != "" && desPath != "")
                {
                    Timer timer = new Timer(x =>
                    {
                        prg.ReadFileFromSharedFolder(souPath, desPath);
                    }, null, 0, 5000);
                }
            }
            else if (mode == "2")
            {
                string ftpPath = ConfigurationManager.AppSettings["ftpPath"];
                Console.WriteLine("FTP Folder Path : {0}", ftpPath);
                string username = ConfigurationManager.AppSettings["ftpUsername"];
                string password = ConfigurationManager.AppSettings["ftpPassword"];

                if (desPath != "" && ftpPath != "")
                {
                    Timer timer = new Timer(x =>
                    {
                        prg.GetFileFromFTP(ftpPath, username, password, desPath);
                    }, null, 0, 5000);
                }
            }
            else
            {
                Console.Write("Wrong Mode");
            }

            Console.ReadKey();

            //while (Console.ReadLine().ToLower() == "exit") ;
        }

        private void ReadFileFromSharedFolder(string souFolderPath, string desFolderPath)
        {
            var getFile = new DirectoryInfo(souFolderPath).GetFiles("*.xml");
            var folderName = "achrive_" + DateTime.Now.ToString("dd-MM-yyyy");
            var rmvFolderName = "remove_" + DateTime.Now.ToString("dd-MM-yyyy");

            if (!Directory.Exists(souFolderPath + "Achrive/" + folderName))
            {
                Directory.CreateDirectory(souFolderPath + "Achrive/" + folderName);
            }

            foreach (var file in getFile)
            {
                try
                {
                    File.Copy(file.FullName, desFolderPath + "/" + file.Name);
                    File.Move(file.FullName, souFolderPath + "Achrive/" + folderName + "/" + file.Name);
                }
                catch
                {
                    if (!Directory.Exists(souFolderPath + "Remove/" + rmvFolderName))
                    {
                        Directory.CreateDirectory(souFolderPath + "Remove/" + rmvFolderName);
                    }
                    File.Move(file.FullName, souFolderPath + "Remove/" + rmvFolderName + "/" + file.Name);
                }
            }
        }

        private void GetFileFromFTP(string ftpPath, string username, string password, string localPath)
        {
            FtpWebRequest fwr = (FtpWebRequest)WebRequest.Create(ftpPath);
            fwr.Credentials = new NetworkCredential(username, password);
            fwr.Method = WebRequestMethods.Ftp.ListDirectory;
            fwr.UseBinary = true;
            string names = "";

            using(var response = (FtpWebResponse)fwr.GetResponse())
            {
                Stream responseStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(responseStream);
                names = reader.ReadToEnd();
                reader.Close();
                response.Close();
            }
            
            var listNames = names.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries).ToList();
            Regex matchExpression = new Regex("^[a-zA-Z0-9].+\\.xml$", RegexOptions.IgnoreCase);
            var xmlName = listNames.Where(x => matchExpression.Match(x).Success).ToList();
            if (xmlName.Count > 0)
            {
                xmlName.ForEach(x =>
                {
                    FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath + "/"+ x);
                    request.Credentials = new NetworkCredential(username, password);
                    request.Method = WebRequestMethods.Ftp.DownloadFile;
                    using (Stream ftpStream = request.GetResponse().GetResponseStream())
                    using (Stream fileStream = File.Create(localPath + "/" + x))
                    {
                        ftpStream.CopyTo(fileStream);
                    }

                    MoveFileFromFTP(ftpPath, username, password, x);
                });
            }
        }

        private void MoveFileFromFTP(string ftpPath, string username, string password, string fileName)
        {
            var folderName = "/archive_" + DateTime.Now.ToString("dd-MM-yyyy");
            CreateDirectoryFTP(ftpPath + "/Archive", username, password, folderName);

            var request = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + fileName);
            request.Credentials = new NetworkCredential(username, password);
            request.Method = WebRequestMethods.Ftp.Rename;
            request.RenameTo = "Archive" + folderName + "/" + fileName;
            FtpWebResponse response = (FtpWebResponse)request.GetResponse();
            response.Close();
        }


        private void CreateDirectoryFTP(string ftpPath, string username, string password, string logPath)
        {
            try
            {
                FtpWebRequest fwr = (FtpWebRequest)WebRequest.Create(ftpPath + logPath);
                fwr.Credentials = new NetworkCredential(username, password);
                fwr.Method = WebRequestMethods.Ftp.ListDirectory;
                var resp = (FtpWebResponse)fwr.GetResponse();
                resp.Close();
            }
            catch
            {
                string ftpUri = ftpPath + logPath;
                var reqCreateDir = (FtpWebRequest)WebRequest.Create(ftpUri);
                reqCreateDir.Credentials = new NetworkCredential(username, password);
                reqCreateDir.Method = WebRequestMethods.Ftp.MakeDirectory;
                var resp = (FtpWebResponse)reqCreateDir.GetResponse();
                resp.Close();
            }
        }
    }
}

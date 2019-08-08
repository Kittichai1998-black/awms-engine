using System;
using System.IO;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace RemoteFile
{
    class Program
    {
        private string desPath;
        private string souPath;
        static void Main(string[] args)
        {
            //\\191.20.80.120\TestReadFile\
            Program prg = new Program();
            Console.WriteLine("Select Mode [1 = Shared Folder, 2 = FTP] : ");
            string mode = Console.ReadLine();
            prg.desPath = ConfigurationManager.AppSettings["localPath"];
            Console.WriteLine("Destination Folder Path : {0}", prg.desPath);

            if (mode == "1")
            {
                prg.souPath = ConfigurationManager.AppSettings["sharedPath"];
                Console.WriteLine("Shared Folder Path : {0}", prg.souPath);

                if (prg.souPath != "" && prg.desPath != "")
                {
                    Task tsk2 = null;
                    var tsk = Task.Run(() =>
                    {
                        while (true)
                        {
                            if (tsk2 != null)
                               Console.Write(" | " + tsk2.IsCompleted.ToString());
                            if (tsk2 != null && (!tsk2.IsCompleted || !tsk2.IsCompletedSuccessfully))
                                tsk2.Dispose();

                            tsk2 = Task.Run(() =>
                            {
                                try
                                {
                                    prg.ReadFileFromSharedFolder(prg.souPath, prg.desPath);
                                }
                                catch (Exception ex)
                                {
                                    Console.Write(ex.Message);
                                }
                            });
                            Thread.Sleep(5000);
                        }
                    });
                    //Timer timer = new Timer(x =>
                    //{
                    //    try
                    //    {
                    //        prg.ReadFileFromSharedFolder(souPath, desPath);
                    //    }
                    //    catch(Exception ex)
                    //    {
                    //        Console.WriteLine(ex.Message);
                    //    }
                    //}, null, 0, 5000);
                    //prg.ReadFileFromSharedFolder(prg.souPath, prg.desPath);
                    //prg.CopyFile(prg.souPath);
                }
            }
            else if (mode == "2")
            {
                string ftpPath = ConfigurationManager.AppSettings["ftpPath"];
                Console.WriteLine("FTP Folder Path : {0}", ftpPath);
                string username = ConfigurationManager.AppSettings["ftpUsername"];
                string password = ConfigurationManager.AppSettings["ftpPassword"];

                if (prg.desPath != "" && ftpPath != "")
                {
                    Timer timer = new Timer(x =>
                    {
                        prg.GetFileFromFTP(ftpPath, username, password, prg.desPath);
                    }, null, 0, 5000);
                }
            }
            else if(mode == "3")
            {
                string souPath = ConfigurationManager.AppSettings["sharedPath"];
                Console.WriteLine("Shared Folder Path : {0}", souPath);
                
                if (souPath != "" && prg.desPath != "")
                {
                    prg.ReadFileFromSharedFolderWithoutMove(souPath, prg.desPath);
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
            var folderName = "archive_" + DateTime.Now.ToString("dd-MM-yyyy");
            var rmvFolderName = "remove_" + DateTime.Now.ToString("dd-MM-yyyy");

            if (!Directory.Exists(souFolderPath + "archive2/" + folderName))
            {
                Directory.CreateDirectory(souFolderPath + "archive2/" + folderName);
            }

            foreach (var file in getFile)
            {
                try
                {
                    File.Copy(file.FullName, desFolderPath + "/" + file.Name);
                    File.Move(file.FullName, souFolderPath + "archive2/" + folderName + "/" + file.Name);
                }
                catch
                {
                    if (!Directory.Exists(souFolderPath + "remove2/" + rmvFolderName))
                    {
                        Directory.CreateDirectory(souFolderPath + "remove2/" + rmvFolderName);
                    }
                    File.Move(file.FullName, souFolderPath + "remove2/" + rmvFolderName + "/" + file.Name);
                }
            }
            Console.Write("\rFile Count : " + getFile.Count() + " | Process Date: " + DateTime.Now);
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
            CreateDirectoryFTP(ftpPath + "/Achrive2", username, password, folderName);

            var request = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + fileName);
            request.Credentials = new NetworkCredential(username, password);
            request.Method = WebRequestMethods.Ftp.Rename;
            request.RenameTo = "Achrive" + folderName + "/" + fileName;
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

        private void ReadFileFromSharedFolderWithoutMove(string souFolderPath, string desFolderPath)
        {
            var getFile = new DirectoryInfo(souFolderPath).GetFiles("*.xml");

            foreach (var file in getFile)
            {
                try
                {
                    Console.WriteLine(file);
                }
                catch
                {
                }
            }
            Console.WriteLine(getFile.Count());
        }

        private void CopyFile(string souFolderPath)
        {
            FileSystemWatcher watcher = new FileSystemWatcher();
            watcher.Path = souFolderPath;
            watcher.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite
                         | NotifyFilters.FileName | NotifyFilters.DirectoryName;
            watcher.Filter = "*.xml";
            watcher.Changed += new FileSystemEventHandler(OnChanged);
            watcher.EnableRaisingEvents = true;
        }

        private void OnChanged(object sender, FileSystemEventArgs e)
        {
            this.ReadFileFromSharedFolder(this.souPath, this.desPath);
        }
    }
}

using AMWUtil.Exception;
using AMWUtil.Logger;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;

namespace AMWUtil.DataAccess
{
    public class FTPFileAccess
    {
        public static List<string> GetListFileFromFTP(string path, string username, string password, string extension, AMWLogger logger)
        {
            try
            {
                FtpWebRequest ftpAccess = (FtpWebRequest)FtpWebRequest.Create(path);
                ftpAccess.Method = WebRequestMethods.Ftp.ListDirectory;
                ftpAccess.Credentials = new NetworkCredential(username, password);

                var responseStream = ((FtpWebResponse)ftpAccess.GetResponse()).GetResponseStream();
                StreamReader reader = new StreamReader(responseStream);
                var readAll = reader.ReadToEnd().Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries).ToList().FindAll(x =>
                {
                    if (!string.IsNullOrWhiteSpace(extension))
                        return x.Contains(extension);
                    else 
                        return true;
                });
                reader.Close();
                reader.Dispose();
                return readAll;
            }
            catch (WebException e)
            {
                throw new AMWException(logger, AMWExceptionCode.S0001, e.Message);
            }
        }

        public static string ReadFileFromFTP(string path, string username, string password, AMWLogger logger)
        {
            try
            {
                WebClient client = new WebClient();
                var credential = new NetworkCredential(username, password);
                client.Encoding = Encoding.UTF8;
                client.Credentials = credential;
                var content = client.DownloadData(path);
                string fileString = Encoding.UTF8.GetString(content);

                client.Dispose();
                return fileString;
            }
            catch (WebException e)
            {
                throw new AMWException(logger, AMWExceptionCode.S0001, e.Message);
            }

        }

        public static List<string> ReadAllFileFromFTP(string path, string username, string password, string extension, AMWLogger logger)
        {
            var listFile = FTPFileAccess.GetListFileFromFTP(path , username, password, extension, logger);
            var res = new List<string>();
            foreach (var filename in listFile)
            {
                var file = FTPFileAccess.ReadFileFromFTP(path + filename, username, password, logger);
                res.Add(file);
            }
            return res;
        }

        public static bool CheckFileExistsFromFTP(string path, string username, string password)
        {
            FtpWebRequest ftpAccess = (FtpWebRequest)FtpWebRequest.Create(path);
            ftpAccess.Method = WebRequestMethods.Ftp.GetFileSize;
            ftpAccess.Credentials = new NetworkCredential(username, password);
            try
            {
                FtpWebResponse response = (FtpWebResponse)ftpAccess.GetResponse();
                response.Close();
                response.Dispose();
                return true;
            }
            catch (WebException ex)
            {
                return false;
            }
        }

        public static void CreateDirectoryToFTP(string path, string username, string password, AMWLogger logger)
        {
            FtpWebRequest ftpAccess = (FtpWebRequest)FtpWebRequest.Create(path);
            ftpAccess.Method = WebRequestMethods.Ftp.MakeDirectory;
            ftpAccess.Credentials = new NetworkCredential(username, password);
            try
            {
                FtpWebResponse response = (FtpWebResponse)ftpAccess.GetResponse();
            }
            catch (WebException ex)
            {
                FtpWebResponse response = (FtpWebResponse)ex.Response;
                if (response.StatusCode != FtpStatusCode.ActionNotTakenFileUnavailable)
                {
                    response.Close();
                    throw new AMWException(logger, AMWExceptionCode.S0001, ex.Message);
                }
                else
                {
                    response.Close();
                }
            }
        }

        public static void MoveFileFromFTP(string ftpPath, string souPath, string desPath, string fileName, string username, string password, AMWLogger logger)
        {
            try
            {
                if (souPath == desPath)
                    return;

                if (!FTPFileAccess.CheckFileExistsFromFTP(ftpPath + souPath + fileName, username, password))
                {
                    throw new AMWException(logger, AMWExceptionCode.S0001, string.Format("Source '{0}' not found!", ftpPath + souPath + fileName));
                }

                CreateDirectoryToFTP(ftpPath + desPath, username, password, logger);

                if (FTPFileAccess.CheckFileExistsFromFTP(ftpPath + desPath + fileName, username, password))
                {
                    throw new AMWException(logger, AMWExceptionCode.S0001, string.Format("Target '{0}' already exists!", ftpPath + desPath + fileName));
                }

                FtpWebRequest ftpAccess = (FtpWebRequest)FtpWebRequest.Create(ftpPath + souPath + fileName);
                ftpAccess.Method = WebRequestMethods.Ftp.Rename;

                ftpAccess.RenameTo = desPath+ fileName;
                ftpAccess.Credentials = new NetworkCredential(username, password);

                var response = ((FtpWebResponse)ftpAccess.GetResponse());
                response.Close();
                response.Dispose();
            }
            catch (WebException e)
            {
                throw new AMWException(logger, AMWExceptionCode.S0001, e.Message);
            }
        }

    }
}

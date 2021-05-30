using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using AMWUtil.Common;
using ProjectGCL.GCLModel.Criterie;
using Renci.SshNet;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.v2
{
    public class SCE04_StockComparision_Engine : AWMSEngine.Engine.BaseEngine<TREQ_Stock_Comparision, TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_Stock_Comparision reqVO)
        {
            string host = this.StaticValue.GetConfigValue("api.sce04.sftp.host");
            string port = this.StaticValue.GetConfigValue("api.sce04.sftp.port");
            string user = this.StaticValue.GetConfigValue("api.sce04.sftp.user");
            string path_prive_key = this.StaticValue.GetConfigValue("api.sce04.sftp.path_prive_key");
            string path_file_local = this.StaticValue.GetConfigValue("api.sce04.sftp.path_file_local");
            string path_file_sftp = this.StaticValue.GetConfigValue("api.sce04.sftp.path_file_sftp");

            reqVO.RECORD.LINE.ForEach(x =>
            {
                var sp = exec(x);

                string file_local = $"{path_file_local}/{x.API_REF}.sftp.csv";
                if (File.Exists(file_local))
                    File.Delete(file_local);

                using (StreamWriter fs = new StreamWriter(file_local))
                {
                    fs.WriteLine($"\"WH_ID\",\"CUSTOMER_CODE\",\"SKU\",\"LOT\",\"UD_CODE\",\"QTY\"");
                    sp.ForEach(x =>
                    {
                        string txt = string.Format("\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",",
                            x.WH_ID, x.CUSTOMER_CODE, x.SKU, x.LOT, x.UD_CODE, x.QTY);
                        fs.WriteLine(txt);
                    });
                }

                using (SftpClient sftpClient = new SftpClient(
                    new ConnectionInfo(host, port.Get2<int>(), user, privateKeyObject(user, path_prive_key))))
                {
                    Logger.LogInfo($"SFTP Connecting : {host}; port={port}; user={user}; keyPart={path_prive_key};");
                    sftpClient.Connect();
                    Logger.LogInfo($"SFTP Uploading");
                    using (FileStream fs = new FileStream(file_local, FileMode.Open))
                    {
                        sftpClient.BufferSize = 1024;
                        sftpClient.UploadFile(fs, Path.GetFileName(path_file_sftp + $"/{x.API_REF}.sftp.csv"));
                    }
                    Logger.LogInfo($"SFTP Upload Complete : local={path_file_local}; sftp={path_file_sftp};");
                    sftpClient.Dispose();
                }

                File.Delete(file_local);
            });





           

            return new TRES__return { };
        }

        private static AuthenticationMethod[] privateKeyObject(string username, string publicKeyPath)
        {
            PrivateKeyFile privateKeyFile = new PrivateKeyFile(publicKeyPath);
            PrivateKeyAuthenticationMethod privateKeyAuthenticationMethod =
                 new PrivateKeyAuthenticationMethod(username, privateKeyFile);
            return new AuthenticationMethod[] { privateKeyAuthenticationMethod };
        }

        private class TRES_SP
        {
            public string WH_ID;
            public string CUSTOMER_CODE;
            public string SKU;
            public string LOT;
            public string UD_CODE;
            public decimal QTY;
        }

        private List<TRES_SP> exec(TREQ_Stock_Comparision.TRecord.TLine req)
        {
            Dapper.DynamicParameters datas = DataADO.GetInstant()
                .CreateDynamicParameters(req, "API_REF", "API_DATE_TIME");
            var res = DataADO.GetInstant().QuerySP<TRES_SP>("RP_CURRENT_INV_EXPORT_CSV", datas, BuVO);
            return res;
        }
    }
}

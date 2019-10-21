using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.Extensions.Hosting;
using System.Threading;
using AMWUtil.DataAccess;
using AWMSModel.Entity;
using AWMSEngine.ADO;

namespace ProjectSTGT.Engine.WM
{
    public class ReadExcelFile : BackgroundService
    {
        public class TRes
        {
            public string skuCode;
            public string orderNo;
            public string SOM;
            public decimal qty;
            public string unit;
            public string carton;
            public string status;
            public string remark;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var tsk = Task.Run(() =>
            {
                ReadFileFromDirectory();
            });
            return tsk;
        }

        private void ReadFileFromDirectory()
        {
            var directoryPath = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "DIRECTORY_PATH").DataValue;
            var resList = new List<TRes>();
            //var getFile = new DirectoryInfo(directoryPath).GetFiles();
            //foreach (var file in getFile)
            //{
            //    try
            //    {
            //        var res = FilesTypeAccess.ExcelAccess(file);
            //    }
            //    catch
            //    {
            //    }
            //}
        }

        private amt_Document CreateDocument(AMWUtil.DataAccess.FilesTypeAccess.ExcelDataResponse excelData)
        {
            var doc = new amt_Document();
            //doc.





            //DocumentADO.GetInstant().Create();
            return null;
        }
    }
}

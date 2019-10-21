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
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;

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
            var getFile = new DirectoryInfo(directoryPath).GetFiles();
            foreach (var file in getFile)
            {
                try
                {
                    var res = FilesTypeAccess.ExcelAccess(file);
                    CreateDocument(res);
                }
                catch
                {
                }
            }
        }

        private void CreateDocument(AMWUtil.DataAccess.FilesTypeAccess.ExcelDataResponse excelData)
        {
            excelData.worksheet.ForEach(data =>
            {
                var xx = data.rows.GroupBy(row => row.cells.Select(cell => cell[0])).Select(x => new { x.Key }).ToList();








                var doc = new CreateGRDocument.TReq();

                doc.documentDate = DateTime.Now;
                doc.eventStatus = DocumentEventStatus.NEW;
                doc.movementTypeID = MovementType.FG_TRANSFER_WM;
                doc.receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>();

                var listItem = new List<CreateGRDocument.TReq.ReceiveItem>();


                var createGRDoc = new AWMSEngine.APIService.Doc.CreateGRDocAPI(null, 0, false);
                var res = createGRDoc.Execute(doc);
            });
        }
    }
}

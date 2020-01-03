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
using AWMSModel.Criteria;

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
                while (true)
                {
                    var dbTrx = AWMSEngine.ADO.DataADO.GetInstant().CreateTransaction();
                    VOCriteria buVO = new VOCriteria(dbTrx);
                    try
                    {
                        ReadFileFromDirectory();
                    }
                    catch {
                    }
                    finally
                    {
                        Thread.Sleep(3000);
                    }
                }
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
                    file.MoveTo($"{directoryPath}\\Archive\\{file.Name}");
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
                var docItems = new List<CreateGRDocument.TReq.ReceiveItem>();
                data.rows.Skip(1).ToList().ForEach(row =>
                {
                    var status = AMWUtil.Common.EnumUtil.GetValueEnum<StorageObjectEventStatus>(row.cells[6]);
                    docItems.Add(new CreateGRDocument.TReq.ReceiveItem()
                    {
                        skuCode = row.cells[0],
                        orderNo = row.cells[1],
                        options = $"carton_no={row.cells[5]}&saleorder={row.cells[2]}&status={status}&remark={row.cells[7]}",
                        quantity = Convert.ToDecimal(row.cells[3]),
                        unitType = row.cells[4]
                    });
                });

                var gDocItems = docItems.GroupBy(docItem => new { docItem.skuCode }).Select(key => new { sku = key.Key, docItems = key.ToList() }).ToList();

                gDocItems.ForEach(x =>
                {
                    try
                    {
                        var doc = new CreateGRDocument.TReq();

                        doc.documentDate = DateTime.Now;
                        doc.eventStatus = DocumentEventStatus.NEW;
                        doc.movementTypeID = MovementType.FG_TRANSFER_WM;
                        doc.receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>();
                        doc.receiveItems = x.docItems;

                        var createGRDoc = new AWMSEngine.APIService.Doc.CreateGRDocAPI(null, 0, false);
                        var res = createGRDoc.Execute(doc);
                    }
                    catch
                    {
                        return;
                    }
                });
            });
        }
    }
}

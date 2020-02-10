using AMWUtil.DataAccess;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTGT.Engine.WM
{
    public class ReadExcelFile : BaseEngine<string, string>
    {
        protected override string ExecuteEngine(string reqVO)
        {
            ReadFileFromDirectory();
            return null;
        }
        private void ReadFileFromDirectory()
        {
            var directoryPath = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "DIRECTORY_PATH").DataValue;
            var getDir = new DirectoryInfo(directoryPath).GetDirectories();
            foreach (var dir in getDir)
            {
                var getFile = dir.GetFiles();
                foreach (var file in getFile)
                {
                    var res = FilesTypeAccess.ExcelAccess(file);
                    var fileName = Path.GetFileNameWithoutExtension(file.Name) + DateTime.Now.ToString("ddMMyyyyhhmmss") + file.Extension;
                    try
                    {
                        CreateDocument(res, dir.Name);
                        if (!Directory.Exists($"{dir.FullName}\\Archive\\{ DateTime.Now.ToString("dd-MM-yyyy")}"))
                        {
                            Directory.CreateDirectory($"{dir.FullName}\\Archive\\{ DateTime.Now.ToString("dd-MM-yyyy")}");
                        }

                        file.MoveTo($"{dir.FullName}\\Archive\\{DateTime.Now.ToString("dd-MM-yyyy")}\\{fileName}");
                    }
                    catch
                    {
                        if (!Directory.Exists($"{dir.FullName}\\Error\\{ DateTime.Now.ToString("dd-MM-yyyy")}"))
                        {
                            Directory.CreateDirectory($"{dir.FullName}\\Error\\{ DateTime.Now.ToString("dd-MM-yyyy")}");
                        }
                        file.MoveTo($"{dir.FullName}\\Error\\{DateTime.Now.ToString("dd-MM-yyyy")}\\{fileName}");
                    }
                }
            }
        }
        private void CreateDocument(FilesTypeAccess.ExcelDataResponse excelData, string movementType)
        {
            excelData.worksheet.ForEach(data =>
            {
                var docItems = new List<CreateGRDocument.TReq.ReceiveItem>();
                data.rows.FindAll(row => !string.IsNullOrWhiteSpace(row.cells[0])).Skip(1).ToList().ForEach(row =>
                {
                    //var status = AMWUtil.Common.EnumUtil.GetValueEnum<StorageObjectEventStatus>(row.cells[6]);
                    docItems.Add(new CreateGRDocument.TReq.ReceiveItem()
                    {
                        skuCode = row.cells[0],
                        orderNo = row.cells[1],
                        options = $"carton_no={row.cells[5].TrimStart('0').PadLeft(1,'0')}&saleorder={row.cells[2]}&status={row.cells[6]}&remark={row.cells[7]}",
                        quantity = Convert.ToDecimal(row.cells[3]),
                        unitType = row.cells[4]
                    });
                });

                //var gDocItems = docItems.GroupBy(docItem => new { docItem.skuCode }).Select(key => new { sku = key.Key, docItems = key.ToList() }).ToList();

                docItems.ForEach(x =>
                {
                    var doc = new CreateGRDocument.TReq();

                    doc.souWarehouseCode = "WH001";
                    doc.desWarehouseCode = "WH001";
                    doc.documentDate = DateTime.Now;
                    doc.eventStatus = DocumentEventStatus.NEW;
                    doc.movementTypeID = AMWUtil.Common.EnumUtil.GetValueEnum<DocumentProcessTypeID>(movementType);
                    doc.receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {x };

                    var createGRDoc = new CreateGRDocument();
                    var res = createGRDoc.Execute(this.Logger, this.BuVO, doc);
                });
            });
        }
    }
}

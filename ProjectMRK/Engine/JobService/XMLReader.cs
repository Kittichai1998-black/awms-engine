using AWMSEngine.Engine;
using AWMSModel.Entity;
using AWMSModel.Criteria;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using Newtonsoft.Json;
using AWMSModel.Constant.EnumConst;
using AMWUtil.Exception;

namespace ProjectMRK.Engine.JobService
{
    public class ReadFileXML : BaseEngine<string, ReadFileXML.TRes>
    {
        private class XMLData
        {
            public MRK_Pallet MRK_MT_PalletID_SAP_to_WMS;

            public class MRK_Pallet
            {
                public Header Header_Pallet;
                public Detail Detail_Pallet;
            }
            public class Header
            {
                public string SenderId;
                public string RecipientId;
                public string CompanyCode;
                public string BranchCode;
                public string WarehouseCode;
                public string JobAction;
                public string JobType;
                public string TransCode;
                public DateTime TransDate;
            }
            public class Detail
            {
                public Record Record_Pallet;
            }
            public class Record
            {
                public string LineNum;
                public string PalletID;
                public string Plant;
                public DateTime ManufactureDate;
                public string ItemNumber;
                public string Quantity;
                public string UOM;
                public string FromBatch;
                public string ToBatch;
                public string FromLocation;
                public string ToLocation;
                public string Flag;
                public string BatchControl;
                public string MonthEndControl;
                public string ProductionQty;
                public string ProductionUOM;
                public string MaterialSlip;
            }
        }

        public class TRes
        {
            public List<DocList> document;
            public class DocList
            {
                public amt_Document doc;
                public StorageObjectCriteria sto;
            }
        }

        //private string ftpPath;
        //private string ftpLogPath;
        //private string ftpUsername;
        //private string ftpPassword;
        private string directoryPath;

        protected override TRes ExecuteEngine(string reqVO)
        {
            //ftpPath = StaticValue.GetConfig("FTP_PATH_ROOT");
            //ftpLogPath = StaticValue.GetConfig("FTP_PATH_LOG");
            //ftpUsername = StaticValue.GetConfig("FTP_USER");
            //ftpPassword = StaticValue.GetConfig("FTP_PASS");
            directoryPath = StaticValue.GetConfigValue("DIRECTORY_PATH");
            var res = ReadFileFromDirectory();

            //FtpWebRequest fwr = (FtpWebRequest)WebRequest.Create(ftpPath);
            //fwr.Credentials = new NetworkCredential(ftpUsername, ftpPassword);
            //fwr.Method = WebRequestMethods.Ftp.ListDirectory;
            //fwr.UseBinary = true;
            //FtpWebResponse response = (FtpWebResponse)fwr.GetResponse();
            //Stream responseStream = response.GetResponseStream();
            //StreamReader reader = new StreamReader(responseStream);
            //string names = reader.ReadToEnd();
            //reader.Close();
            //response.Close();
            //var listNames = names.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries).ToList();
            //Regex matchExpression = new Regex("^[a-zA-Z0-9].+\\.xml$", RegexOptions.IgnoreCase);
            //var xmlName = listNames.Where(x => matchExpression.Match(x).Success).ToList();

            //TRes res = new TRes();
            //List<TRes.DocList> docList = new List<TRes.DocList>();
            //if (xmlName.Count > 0)
            //{
            //    //xmlName.ForEach(x =>
            //    //{
            //    //    var docRes = ReadListFileXMLFromFTP(x);
            //    //    docList.Add(docRes);
            //    //});
            //}
            //res.document = docList;
            return res;
        }

        //private TRes.DocList ReadListFileXMLFromFTP(string xmlname)
        //{
        //    var request = (FtpWebRequest)WebRequest.Create(ftpPath + xmlname);
        //    request.Credentials = new NetworkCredential(ftpUsername, ftpPassword);
        //    request.Method = WebRequestMethods.Ftp.DownloadFile;
        //    FtpWebResponse response = (FtpWebResponse)request.GetResponse();

        //    Stream responseStream = response.GetResponseStream();
        //    StreamReader reader = new StreamReader(responseStream);
        //    var xmlData = reader.ReadToEnd();
        //    XmlDocument doc = new XmlDocument();
        //    doc.LoadXml(xmlData);
        //    var json = JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.Indented);

        //    Console.WriteLine("Download Complete, status {0}", response.StatusDescription);

        //    var jsonObj = JsonConvert.DeserializeObject<XMLData>(json);

        //    reader.Close();
        //    reader.Dispose();
        //    response.Close();

        //    var res = CreateDocumentFromXML(jsonObj);

        //    MoveFileXML(xmlname);

        //    return res;
        //}

        //private void MoveFileXML(string xmlname)
        //{
        //    var folderName = "log_" + DateTime.Now.ToString("dd-MM-yyyy");
        //    CreateDirectoryFTP(folderName);

        //    var request = (FtpWebRequest)WebRequest.Create(ftpPath + xmlname);
        //    request.Credentials = new NetworkCredential(ftpUsername, ftpPassword);
        //    request.Method = WebRequestMethods.Ftp.Rename;
        //    request.RenameTo = "log/" + folderName + "/" + xmlname;
        //    FtpWebResponse response = (FtpWebResponse)request.GetResponse();
        //    response.Close();
        //}

        //private void CreateDirectoryFTP(string folderName)
        //{
        //    try
        //    {
        //        FtpWebRequest fwr = (FtpWebRequest)WebRequest.Create(ftpLogPath + folderName);
        //        fwr.Credentials = new NetworkCredential(ftpUsername, ftpPassword);
        //        fwr.Method = WebRequestMethods.Ftp.ListDirectory;
        //        var resp = (FtpWebResponse)fwr.GetResponse();
        //        resp.Close();
        //    }
        //    catch
        //    {
        //        string ftpUri = "ftp://191.20.80.120:8089/MRK/recieved/log/" + folderName.ToString();
        //        var reqCreateDir = (FtpWebRequest)WebRequest.Create(ftpUri);
        //        reqCreateDir.Credentials = new NetworkCredential(ftpUsername, ftpPassword);
        //        reqCreateDir.Method = WebRequestMethods.Ftp.MakeDirectory;

        //        using (var resp = (FtpWebResponse)reqCreateDir.GetResponse())
        //        {
        //            Console.WriteLine(resp.StatusCode);
        //        }
        //    }
        //}

        private TRes.DocList CreateDocumentFromXML(XMLData json, string XMLFullName, string XMLName)
        {
            TRes.DocList res = new TRes.DocList();
            var jsonHeader = json.MRK_MT_PalletID_SAP_to_WMS.Header_Pallet;
            var jsonDetail = json.MRK_MT_PalletID_SAP_to_WMS.Detail_Pallet.Record_Pallet;

            var fromWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == jsonDetail.FromLocation);
            if (fromWarehouse == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Warehouse " + jsonDetail.FromLocation + " NotFound");
            }
            var toWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == jsonDetail.FromLocation);
            if (toWarehouse == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Warehouse " + jsonDetail.ToLocation + " NotFound");
            }

            var sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(jsonDetail.ItemNumber, this.BuVO);
            if (sku == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SKU " + jsonDetail.ItemNumber + " NotFound");

            var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(jsonDetail.ItemNumber, this.BuVO);
            if (pack == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SKU " + jsonDetail.ItemNumber + " NotFound");

            var unit = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_UnitType>(jsonDetail.UOM, this.BuVO);
            if (unit == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Unit Type " + jsonDetail.UOM + " NotFound");

            var objSizeBase = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);
            var objSizePack = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK);

            var getBase = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(jsonDetail.PalletID, this.BuVO);

            var chkPallet = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<amt_StorageObject>(jsonDetail.PalletID, this.BuVO);

            if(chkPallet != null)
            {
                DeleteFileXMLDirectory(XMLFullName, XMLName);
                return null;
            }
            else
            {
                long baseID;
                if (getBase == null)
                {
                    baseID = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(this.BuVO, new ams_BaseMaster()
                    {
                        Code = jsonDetail.PalletID,
                        Name = jsonDetail.PalletID,
                        BaseMasterType_ID = 6,
                        Description = "Pallet",
                        ObjectSize_ID = objSizeBase.ID.Value,
                        Status = EntityStatus.ACTIVE,
                        UnitType_ID = 1,
                        WeightKG = null
                    }).Value;
                }
                else
                {
                    baseID = getBase.ID.Value;
                }

                StorageObjectCriteria baseSto = new StorageObjectCriteria()
                {
                    code = jsonDetail.PalletID,
                    eventStatus = StorageObjectEventStatus.NEW,
                    name = "Pallet",
                    qty = 1,
                    unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
                    unitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                    baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
                    baseUnitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                    baseQty = 1,
                    objectSizeID = objSizeBase.ID.Value,
                    type = StorageObjectType.BASE,
                    mstID = baseID,
                    objectSizeName = objSizeBase.Name,
                };

                var stoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);
                var childSto = new StorageObjectCriteria()
                {
                    parentID = stoID,
                    parentType = StorageObjectType.BASE,
                    code = jsonDetail.ItemNumber,
                    eventStatus = StorageObjectEventStatus.NEW,
                    name = sku.Name,
                    batch = jsonDetail.ToBatch,
                    qty = Convert.ToDecimal(jsonDetail.Quantity),
                    skuID = sku.ID,
                    unitCode = unit.Code,
                    unitID = unit.ID.Value,
                    baseUnitCode = unit.Code,
                    baseUnitID = unit.ID.Value,
                    baseQty = Convert.ToDecimal(jsonDetail.Quantity),
                    objectSizeID = objSizePack.ID.Value,
                    type = StorageObjectType.PACK,
                    productDate = jsonDetail.ManufactureDate,
                    objectSizeName = objSizePack.Name,
                    mstID = pack.ID
                };
                var childStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(childSto, this.BuVO);

                var skuMovementType = StaticValue.SKUMasterTypes.FirstOrDefault(x => x.ID == sku.SKUMasterType_ID);

                amt_Document doc = new amt_Document()
                {
                    ID = null,
                    Code = null,
                    ParentDocument_ID = null,
                    Lot = null,
                    Batch = jsonDetail.ToBatch,
                    For_Customer_ID = null,
                    Sou_Customer_ID = null,
                    Sou_Supplier_ID = null,
                    Sou_Branch_ID = fromWarehouse.ID.Value,
                    Sou_Warehouse_ID = fromWarehouse.ID.Value,
                    Sou_AreaMaster_ID = null,

                    Des_Customer_ID = null,
                    Des_Supplier_ID = null,
                    Des_Branch_ID = toWarehouse.ID.Value,
                    Des_Warehouse_ID = toWarehouse.ID.Value,
                    Des_AreaMaster_ID = null,
                    DocumentDate = jsonHeader.TransDate,
                    ActionTime = null,
                    MovementType_ID = skuMovementType.Code.ToUpper() == "FASTMOVE" ? MovementType.FG_FAST_TRANSFER_WM : MovementType.FG_TRANSFER_WM,
                    RefID = null,
                    Ref1 = null,
                    Ref2 = null,

                    DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                    EventStatus = DocumentEventStatus.NEW,

                    Remark = null,
                    Options = "basecode=" + jsonDetail.PalletID,
                    Transport_ID = null,

                    DocumentItems = new List<amt_DocumentItem>(),

                };
                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = sku.Code,
                    SKUMaster_ID = sku.ID.Value,
                    PackMaster_ID = pack.ID,

                    Quantity = Convert.ToDecimal(jsonDetail.Quantity),
                    UnitType_ID = unit.ID,
                    BaseQuantity = Convert.ToDecimal(jsonDetail.Quantity),
                    BaseUnitType_ID = unit.ID,

                    OrderNo = null,
                    Batch = jsonDetail.ToBatch,
                    Lot = null,

                    Options = null,
                    ExpireDate = null,
                    ProductionDate = jsonDetail.ManufactureDate,
                    Ref1 = null,
                    Ref2 = null,
                    RefID = "basecode=" + jsonDetail.PalletID,

                    EventStatus = DocumentEventStatus.NEW,

                });

                var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, this.BuVO).ID;

                var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(docID.Value, this.BuVO);
                var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(stoID, StorageObjectType.BASE, false, true, this.BuVO);
                var stoList = stos.ToTreeList();
                var stoPack = stoList.Where(x => x.type == StorageObjectType.PACK);
                amt_DocumentItemStorageObject disto = new amt_DocumentItemStorageObject();
                docItems.ForEach(docItem =>
                {
                    var sto = stoPack.FirstOrDefault(x => x.skuID == docItem.SKUMaster_ID);
                    disto = new amt_DocumentItemStorageObject()
                    {
                        ID = null,
                        DocumentItem_ID = docItem.ID.Value,
                        Sou_StorageObject_ID = sto.id.Value,
                        Des_StorageObject_ID = sto.id.Value,
                        Quantity = docItem.Quantity.Value,
                        BaseQuantity = docItem.Quantity.Value,
                        UnitType_ID = docItem.BaseUnitType_ID.Value,
                        BaseUnitType_ID = docItem.BaseUnitType_ID.Value,
                        Status = EntityStatus.INACTIVE
                    };
                });

                AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, this.BuVO);
                doc.ID = docID;
                res.doc = doc;
                baseSto.mapstos = new List<StorageObjectCriteria>() { childSto };
                res.sto = baseSto;

                return res;
            }

        }

        private TRes ReadFileFromDirectory()
        {
            TRes res = new TRes();
            var resList = new List<TRes.DocList>();
            var getFile = new DirectoryInfo(directoryPath).GetFiles("*.xml");
            foreach(var file in getFile)
            {
                var doc = ReadListFileXMLFromDirectory(file);
                resList.Add(doc);
            }
            res.document = resList;
            return res;
        }

        private TRes.DocList ReadListFileXMLFromDirectory(FileInfo xml)
        {
            var xmlData = File.ReadAllText(xml.FullName);
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(xmlData);
            var json = JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.Indented);

            var jsonObj = JsonConvert.DeserializeObject<XMLData>(json);

            var res = CreateDocumentFromXML(jsonObj, xml.FullName, xml.Name);
            if(res != null)
                MoveFileXMLDirectory(xml.FullName, xml.Name);

            return res;
        }

        private void MoveFileXMLDirectory(string xmlPath, string xmlname)
        {
            var folderName = "achrive_" + DateTime.Now.ToString("dd-MM-yyyy");
            if (!Directory.Exists(directoryPath + "Achrive/" + folderName))
            {
                Directory.CreateDirectory(directoryPath + "Achrive/" + folderName);
            }

            File.Move(xmlPath, directoryPath + "Achrive/" + folderName + "/" + xmlname);
        }
        private void DeleteFileXMLDirectory(string xmlPath, string xmlname)
        {
            var folderName = "error_" + DateTime.Now.ToString("dd-MM-yyyy");
            if (!Directory.Exists(directoryPath + "Achrive/" + folderName))
            {
                Directory.CreateDirectory(directoryPath + "Error/" + folderName);
            }

            File.Move(xmlPath, directoryPath + "Error/" + folderName + "/" + xmlname);
        }
    }
}

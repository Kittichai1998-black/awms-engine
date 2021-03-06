using ADO.WMSStaticValue;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.HubService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjectBOTHY.Model;
using System.Globalization;
using AMWUtil.DataAccess;
using ProjectBOTHY.Engine.FileGenerate;
using AMWUtil.Logger;
using Microsoft.Extensions.Logging;

namespace ProjectBOTHY.Worker
{
    public class ReadFileFromFTP : AWMSEngine.WorkerService.BaseWorkerService
    {
        public ReadFileFromFTP(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, logger, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            
            var StaticValue = StaticValueManager.GetInstant();
            var folderIn = StaticValue.GetConfigValue("ERP.FILE.File_In_Path");
            var folderSuccess = StaticValue.GetConfigValue("ERP.FILE.File_Succ_Path");
            var folderError = StaticValue.GetConfigValue("ERP.FILE.File_Err_Path");
            var _text = LocalFileAccess.GetFileList(folderIn, "txt").ToList();
            var textDetails = new FileFormat.TextFileDetail();
            _text.ForEach(x =>
            {
                try
                {
                    var text = LocalFileAccess.ReadFile(x);
                    var txtDetail = text.Split("\r\n").ToList().FindAll(y => !string.IsNullOrWhiteSpace(y));
                    if (txtDetail.Count() > 0)
                    {
                        var header = txtDetail.First().Split("|");
                        var footer = txtDetail.Last().Split("|");
                        textDetails = new FileFormat.TextFileDetail()
                        {
                            header = new FileFormat.TextFileHeader()
                            {
                                prefix = header[0],
                                command = header[1],
                                commandNo = header[2],
                            },
                            footer = new FileFormat.TextFileHeader()
                            {
                                prefix = footer[0],
                                command = footer[1],
                                commandNo = footer[2],
                                rowCount = string.IsNullOrWhiteSpace(footer[3]) ? (int?)null : Convert.ToInt32(footer[3]),
                                timestamp = string.IsNullOrWhiteSpace(footer[4]) ? null : footer[4],
                            }
                        };

                        var docItemDetails = txtDetail.Skip(1).SkipLast(1).ToList();
                        var setDetail = docItemDetails.Select(y =>
                        {
                            var detail = y.Split("|");
                            return new FileFormat.ItemDetail()
                            {
                                skuType = detail[0],
                                baseType = detail[1],
                                baseCode = detail[2],
                                price = string.IsNullOrWhiteSpace(detail[3]) ? null : detail[3],
                                category = detail[4],
                                type = detail[5],
                                owner = detail[6],
                                cashcenter = detail[7],
                                receiveDate = string.IsNullOrWhiteSpace(detail[8]) ? null : detail[8],
                                quantity = string.IsNullOrWhiteSpace(detail[9]) ? (decimal?)null : Convert.ToDecimal(detail[9]),
                                stationIn = detail[10],
                                stationOut = detail[11],
                            };
                        }).ToList();
                        textDetails.details = setDetail;

                        if (textDetails.header.command == "STOREIN")
                        {
                            var resDoc = this.CreateDocFromFile(textDetails, DocumentTypeID.GOODS_RECEIVE, null, buVO);

                            var _baseType = StaticValue.BaseMasterTypes.Find(y => y.Code == textDetails.details.First().baseType);
                            this.CreateBaseMaster(resDoc, _baseType, buVO);
                        }
                        else if (textDetails.header.command == "STOREOUT")
                        {
                            var resDoc = this.CreateDocFromFile(textDetails, DocumentTypeID.GOODS_ISSUE, null, buVO);
                        }
                        else if (textDetails.header.command.StartsWith("CANCEL"))
                        {
                            var docs = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("RefID", textDetails.header.commandNo, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("EventStatus", DocumentEventStatus.NEW, SQLOperatorType.EQUALS),
                            }, buVO);

                            if (docs.Count > 0)
                            {
                                if (docs.Any(z => z.EventStatus != DocumentEventStatus.NEW))
                                {
                                    string fileName = $"ERR_{textDetails.header.command}_{textDetails.header.commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";

                                    var path = StaticValue.GetConfigValue("ERP.FILE.File_Root_Path") + StaticValue.GetConfigValue("ERP.FILE.File_Err_Path") + fileName;

                                    new ErrorResponseGenerate().Execute(buVO.Logger, buVO, new ErrorResponseGenerate.Treq()
                                    {
                                        header = textDetails.header,
                                        details = textDetails.details,
                                        footer = textDetails.footer,
                                        error = "เอกสารกำลังทำงาน ไม่สามารถยกเลิกได้"
                                    });
                                }
                                else
                                {
                                    docs.Select(a => a.ID).ToList().ForEach(a =>
                                        {
                                            var distos = ADO.WMSDB.DocumentADO.GetInstant().ListDISTOByDoc(a.Value, buVO);
                                            if (distos.Count > 0)
                                            {
                                                var pstos = distos.Select(x => x.Sou_StorageObject_ID).ToList();
                                                var baseStoIDs = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria()
                                                {
                                                    field = "ID",
                                                    value = string.Join(",", pstos),
                                                    operatorType = SQLOperatorType.IN
                                                }, buVO).Select(x => x.ParentStorageObject_ID).Distinct().ToList();
                                                baseStoIDs.ForEach(bsto =>
                                                {
                                                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.Value, StorageObjectEventStatus.NEW, null, StorageObjectEventStatus.REJECTED, buVO);
                                                });
                                                distos.ForEach(disto => ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.REMOVE, buVO));
                                            }
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(a.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, buVO);
                                        }
                                    );
                                    new ResponseGenerate().Execute(buVO.Logger, buVO, textDetails);
                                }
                            }
                            else
                            {
                                new ErrorResponseGenerate().Execute(buVO.Logger, buVO, new ErrorResponseGenerate.Treq()
                                {
                                    header = textDetails.header,
                                    details = textDetails.details,
                                    footer = textDetails.footer,
                                    error = "ไม่พบเอกสารที่ต้องการยกเลิก"
                                });
                            }
                        }
                    }
                }
                catch (Exception e)
                {
                    new ErrorResponseGenerate().Execute(buVO.Logger, buVO, new ErrorResponseGenerate.Treq()
                    {
                        header = textDetails.header,
                        details = textDetails.details,
                        footer = textDetails.footer,
                        error = e.Message.ToString()
                    });
                }

                LocalFileAccess.MoveFile(x, folderSuccess, folderError);
            });
        }

        private amt_Document CreateDocFromFile(FileFormat.TextFileDetail docItemDetail, DocumentTypeID docType, string options, VOCriteria buVO)
        {
            ams_AreaMaster _desArea = new ams_AreaMaster();
            ams_AreaMaster _souArea = new ams_AreaMaster();
            string souArea = "";
            string desArea = "";

            try
            {
                if (docItemDetail.header.command == "STOREIN")
                {
                    desArea = docItemDetail.details.First().stationIn;
                    _desArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationIn);
                    if (_desArea == null)
                        throw new Exception();
                }
                else if (docItemDetail.header.command == "STOREOUT")
                {
                    souArea = docItemDetail.details.First().stationOut;
                    _souArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationOut);
                    if (_souArea == null)
                        throw new Exception();
                }
                else if (docItemDetail.header.command == "TRANSFER")
                {
                    souArea = docItemDetail.details.First().stationIn;
                    desArea = docItemDetail.details.First().stationOut;
                    _desArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationOut);
                    _souArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationIn);
                    if(_desArea == null || _souArea == null)
                        throw new Exception();
                }
            }
            catch
            {
                string textError = "";
                if (docItemDetail.header.command == "STOREIN")
                    textError = $"ไม่พบ Area {desArea}";
                else if (docItemDetail.header.command == "STOREOUT")
                    textError = $"ไม่พบ Area {souArea}";
                else
                {
                    if(_desArea == null && _souArea == null)
                        textError = $"ไม่พบ Area ต้นทาง {souArea} และ Area ปลายทาง {desArea}";
                    else if(_desArea == null)
                        textError = $"ไม่พบ Area ปลายทาง {desArea}";
                    else
                        textError = $"ไม่พบ Area ต้นทาง {souArea}";
                }
                new ErrorResponseGenerate().Execute(buVO.Logger, buVO, new ErrorResponseGenerate.Treq()
                {
                    header = docItemDetail.header,
                    details = docItemDetail.details,
                    footer = docItemDetail.footer,
                    error = textError
                });

                throw new AMWException(this.Logger, AMWExceptionCode.V2001, $"ไม่พบ Area ในระบบ");
            }
            

            var parentDoc = new amt_Document()
            {
                ActionTime = DateTime.Now,
                DocumentDate = DateTime.Now,
                DocumentProcessType_ID = DocumentProcessTypeID.WM_TRANSFER_AUTO,
                DocumentType_ID = docType,
                ParentDocument = null,
                DocumetnChilds = null,
                EventStatus = DocumentEventStatus.NEW,
                ProductOwner_ID = docItemDetail.details.First().owner == "BOT" || string.IsNullOrEmpty(docItemDetail.details.First().owner) ? 1 : 2,
                Status = EntityStatus.ACTIVE,
                Options = $"textFile={Newtonsoft.Json.JsonConvert.SerializeObject(docItemDetail.footer)}",
                Des_Warehouse_ID = _desArea.Warehouse_ID,
                Des_AreaMaster_ID = _desArea.ID,
                Sou_AreaMaster_ID = _souArea.ID,
                Sou_Warehouse_ID = _souArea.Warehouse_ID,
                RefID = docItemDetail.header.commandNo,
            };

            var packList = new List<ams_PackMaster>();
            var docItem = docItemDetail.details.Select(x =>
            {
                var skuType = StaticValueManager.GetInstant().SKUMasterTypes.Find(ty => ty.Code == x.skuType);
                var curPack = new ams_PackMaster();

                if (skuType.Code == "ASSET" || skuType.Code == "EMPTY")
                {
                    curPack = packList.Find(pack => pack.Code == x.price);
                    if (curPack == null)
                    {
                        curPack = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("Code", skuType.Code, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                        }, buVO).FirstOrDefault();
                        packList.Add(curPack);
                    }
                }
                else if (skuType.Code == "BANKNOTE")
                {
                    try
                    {
                        curPack = packList.Find(pack => pack.Code == x.price);
                        if (curPack == null)
                        {
                            curPack = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(new SQLConditionCriteria[]
                            {
                            new SQLConditionCriteria("Code", x.price, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                            }, buVO).FirstOrDefault();

                            if (curPack == null)
                            {
                                var curSKU = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(new SQLConditionCriteria[]
                                {
                                new SQLConditionCriteria("Code", x.price, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                                }, buVO).FirstOrDefault();

                                if (curSKU == null)
                                {
                                    curSKU = new ams_SKUMaster()
                                    {
                                        Code = x.price,
                                        Name = x.price,
                                        UnitType_ID = StaticValueManager.GetInstant().UnitTypes.Find(y => y.Code == "Banknote").ID,
                                        ID = null,
                                        SKUMasterType_ID = skuType.ID.Value,
                                        Status = EntityStatus.ACTIVE,
                                        Price = Convert.ToDecimal(x.price),
                                        Description = ""
                                    };
                                    var resID = ADO.WMSDB.DataADO.GetInstant().Insert(buVO, curSKU);
                                    curSKU.ID = resID;

                                    curPack = new ams_PackMaster()
                                    {
                                        Code = x.price,
                                        Name = x.price,
                                        UnitType_ID = StaticValueManager.GetInstant().UnitTypes.Find(y => y.Code == "Banknote").ID.Value,
                                        ID = null,
                                        Status = EntityStatus.ACTIVE,
                                        ObjectSize_ID = 2,
                                        SKUMaster_ID = curSKU.ID.Value
                                    };
                                    var resPackID = ADO.WMSDB.DataADO.GetInstant().Insert(buVO, curPack);
                                    curPack.ID = resPackID;
                                }
                                else
                                {
                                    curPack = new ams_PackMaster()
                                    {
                                        Code = x.price,
                                        Name = x.price,
                                        UnitType_ID = StaticValueManager.GetInstant().UnitTypes.Find(y => y.Code == "Banknote").ID.Value,
                                        ID = null,
                                        Status = EntityStatus.ACTIVE,
                                        ObjectSize_ID = 2,
                                        SKUMaster_ID = curSKU.ID.Value
                                    };
                                    var resID = ADO.WMSDB.DataADO.GetInstant().Insert(buVO, curPack);
                                    curPack.ID = resID;
                                }
                            }
                        }
                    }
                    catch
                    {
                        new ErrorResponseGenerate().Execute(buVO.Logger, buVO, new ErrorResponseGenerate.Treq()
                        {
                            header = docItemDetail.header,
                            details = docItemDetail.details,
                            footer = docItemDetail.footer,
                            error = "ข้อมูลไฟล์ไม่ถูกต้อง กรุณาตรวจสอบไฟล์อีกครั้ง"
                        });
                    }
                }

                return new amt_DocumentItem()
                {
                    Code = string.IsNullOrWhiteSpace(curPack.Code) ? null : curPack.Code,
                    BaseCode = string.IsNullOrWhiteSpace(x.baseCode) ? null : x.baseCode,
                    //Quantity = skuType.Code == "BANKNOTE" ? x.quantity : 1,
                    //UnitType_ID = curPack.UnitType_ID,
                    //BaseQuantity = skuType.Code == "BANKNOTE" ? x.quantity : 1,
                    //BaseUnitType_ID = curPack.UnitType_ID,
                    Quantity = x.quantity,
                    UnitType_ID = curPack.UnitType_ID,
                    BaseQuantity = x.quantity,
                    BaseUnitType_ID = curPack.UnitType_ID,
                    Ref1 = string.IsNullOrWhiteSpace(x.owner) ? null : x.owner,
                    Ref2 = string.IsNullOrWhiteSpace(x.category) ? null : x.category,
                    Ref3 = string.IsNullOrWhiteSpace(x.type) ? null : x.type,
                    Ref4 = string.IsNullOrWhiteSpace(x.cashcenter) ? null : x.cashcenter,
                    Options = $"textFile={Newtonsoft.Json.JsonConvert.SerializeObject(x)}",
                    EventStatus = DocumentEventStatus.NEW,
                    Status = EntityStatus.ACTIVE,
                    ProductionDate = string.IsNullOrWhiteSpace(x.receiveDate) ? (DateTime?)null : DateTime.ParseExact(x.receiveDate, "yyyyMMdd", CultureInfo.InvariantCulture),
                    PackMaster_ID = curPack.ID,
                    SKUMaster_ID = curPack.SKUMaster_ID
                };
            }).ToList();

            parentDoc.DocumentItems = docItem;
            var parentRes = ADO.WMSDB.DocumentADO.GetInstant().Create(parentDoc, buVO);

            var childDoc = parentRes.Clone();
            childDoc.ID = null;
            childDoc.DocumentType_ID = docType == DocumentTypeID.GOODS_RECEIVE ? DocumentTypeID.PUTAWAY : DocumentTypeID.PICKING;
            childDoc.EventStatus = DocumentEventStatus.NEW;
            childDoc.ParentDocument_ID = parentRes.ID;
            childDoc.DocumentItems = parentRes.DocumentItems.Clone().Select(x =>
            {
                x.ParentDocumentItem_ID = x.ID;
                x.ID = null;
                return x;
            }).ToList();

            var childRes = ADO.WMSDB.DocumentADO.GetInstant().Create(childDoc, buVO);
            //parentRes.DocumetnChilds = new List<amt_Document>() { childRes };

            return childRes;
        }

        private void CreateBaseMaster(amt_Document doc, ams_BaseMasterType baseMasterType, VOCriteria buVO)
        {
            var  baseGroup = doc.DocumentItems.GroupBy(x=> x.BaseCode).Select(x=> new { baseCode = x.Key, docItem = x.ToList() }).ToList();

            baseGroup.ForEach(baseCode =>
            {
                var baseMaster = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_BaseMaster>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Code", baseCode.baseCode, SQLOperatorType.EQUALS),
                }, buVO).FirstOrDefault();

                if (baseMaster == null)
                {
                    baseMaster = new ams_BaseMaster()
                    {
                        ID = null,
                        Code = baseCode.baseCode,
                        BaseMasterType_ID = baseMasterType.ID,
                        Name = baseCode.baseCode,
                        Status = EntityStatus.ACTIVE,
                        ObjectSize_ID = 2,
                        UnitType_ID = StaticValueManager.GetInstant().UnitTypes
                            .FindAll(x => x.ObjectType == StorageObjectType.BASE)
                            .Find(x => x.Code.ToUpper() == baseMasterType.Code.ToUpper()).ID.Value,
                    };
                    var resID = ADO.WMSDB.DataADO.GetInstant().Insert(buVO, baseMaster);
                    baseMaster.ID = resID;
                }

                //var findStageArea = StaticValueManager.GetInstant().AreaMasters.Find(x => x.AreaMasterType_ID == AreaMasterTypeID.STO_STAGING);

                //var stoBase = new StorageObjectCriteria()
                //{
                //    code = baseMaster.Code,
                //    eventStatus = StorageObjectEventStatus.ACTIVE,
                //    name = baseMaster.Name,
                //    parentID = null,
                //    qty = 1,
                //    baseQty = 1,
                //    unitID = baseMaster.UnitType_ID,
                //    baseUnitID = baseMaster.UnitType_ID,
                //    unitCode = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == baseMaster.UnitType_ID).Code,
                //    baseUnitCode = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == baseMaster.UnitType_ID).Code,
                //    type = StorageObjectType.BASE,
                //    areaID = findStageArea.ID,
                //    warehouseID = 1,
                //    mstID = baseMaster.ID,
                //    productOwner = doc.ProductOwner_ID,
                //    id = null
                //};

                //var bstoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(stoBase, buVO);
                //stoBase.id = bstoID;

                //List<StorageObjectCriteria> stos = new List<StorageObjectCriteria>();

                //foreach (var Item in baseCode.docItem)
                //{
                //    //var unitType = StaticValueManager.GetInstant().UnitTypes.Find(x => skuMasterType.Code.ToUpper() == x.Code.ToUpper());
                //    if (stoBase != null)
                //    {
                //        var unitTypeSku = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == Item.UnitType_ID);
                //        var stoPack = new StorageObjectCriteria()
                //        {
                //            id = null,
                //            code = Item.Code,
                //            eventStatus = StorageObjectEventStatus.NEW,
                //            name = Item.Code,
                //            parentID = stoBase.id,
                //            parentType = StorageObjectType.BASE,
                //            qty = Item.Quantity.Value,
                //            baseQty = Item.Quantity.Value,
                //            unitID = Item.UnitType_ID.Value,
                //            baseUnitID = Item.UnitType_ID.Value,
                //            unitCode = unitTypeSku.Code,
                //            baseUnitCode = unitTypeSku.Code,
                //            type = StorageObjectType.PACK,
                //            areaID = doc.Des_AreaMaster_ID,
                //            warehouseID = 1,
                //            mstID = Item.PackMaster_ID,
                //            options = Item.Options,
                //            ref1 = Item.Ref1,
                //            ref2 = Item.Ref2,
                //            ref3 = Item.Ref3,
                //            ref4 = Item.Ref4,
                //            productDate = Item.ProductionDate,
                //            skuID = Item.SKUMaster_ID,
                //            productOwner = doc.ProductOwner_ID,
                //            AuditStatus = AuditStatus.QUARANTINE,
                //        };

                //        var pstoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(stoPack, buVO);
                //        stoPack.id = pstoID;

                //        stos.Add(stoPack);

                //        var disto = new amt_DocumentItemStorageObject()
                //        {
                //            IsLastSeq = false,
                //            DocumentItem_ID = Item.ID,
                //            DocumentType_ID = DocumentTypeID.GOODS_RECEIVE,
                //            WorkQueue_ID = null,
                //            Sou_StorageObject_ID = stoPack.id.Value,
                //            Sou_WaveSeq_ID = null,
                //            Status = 0,
                //            Des_StorageObject_ID = null,
                //            Des_WaveSeq_ID = null,
                //            Quantity = Item.Quantity.Value,
                //            BaseQuantity = Item.Quantity.Value,
                //            UnitType_ID = Item.UnitType_ID.Value,
                //            BaseUnitType_ID = Item.UnitType_ID.Value
                //        };
                //        var distoBase = ADO.WMSDB.DistoADO.GetInstant().Insert(disto, buVO);
                //    }
                //}

                //stoBase.mapstos = stos;
            });
        }
    }
}

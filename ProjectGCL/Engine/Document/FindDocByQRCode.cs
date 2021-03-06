using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectGCL.Engine.Document
{
    public class FindDocByQRCode : BaseEngine<FindDocByQRCode.TReq, FindDocByQRCode.TRes>
    {

        public class TReq
        {
            public List<qrCode> qrCodes;

            public class qrCode
            {
                public string qrCode1;
                public string qrCode2;
            }

        };

        public class TRes
        {
            public DocumentProcessTypeID processType;
            public long putawayID;
            public string putawayCode;
            public long? docId;
            public string docCode;
            public string skuCode;
            public long? skuId;
            public string skuName;
            public string gade;
            public string lot;
            public string start_pallet;
            public string end_pallet;
            public List<PackSto> datas;
        }
        public class PackSto
        {
            public string pstoCode;
            public string pstoName;
            public string batch;
            public string lot;
            public string orderNo;
            public string itemNo;
            public string refID;
            public string ref1;
            public string ref2;//SKU1,SKU1|B001,B002|100,500|PC,CAR
            public string ref3;
            public string ref4;
            public string cartonNo;
            public long? forCustomerID;
            public string options;
            public decimal? addQty;
            public string unitTypeCode; // old unit 
            public string packUnitTypeCode;
            public AuditStatus? auditStatus;
            public DateTime? expiryDate;
            public DateTime? incubationDate;
            public DateTime? productDate;
        }
        public class QR
        {
            public string gade;
            public string lot;
            public string pallet;

        };
        public class PalletNo
        {
            public string discharge;
            public string startPallet;
            public string endPallet;

        };
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            var packList = new List<PackSto>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();
            //res.datas = new List<TRes.DocData>();
            foreach (var qrCode in reqVO.qrCodes)
            {
                var qrModel1 = ObjectUtil.ConvertTextFormatToModel<QR>(qrCode.qrCode1, "{gade} {lot} {pallet}");
                var qrModel2 = ObjectUtil.ConvertTextFormatToModel<QR>(qrCode.qrCode2, "{gade} {lot} {pallet}");

                if (qrModel1 == null && qrModel2 == null)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "QRCode not Found");

                }
                else if (qrModel1 != null && qrModel2 != null)
                {

                    if (qrModel1.lot != qrModel2.lot)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Lot not Correct");

                    }
                    else
                    {
                        var docItembygade = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                         new SQLConditionCriteria("ref1",string.Join(',',qrModel1.gade), SQLOperatorType.IN),
                         new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                      }, this.BuVO);

                        var docItembylot = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("lot",string.Join(',',qrModel1.lot), SQLOperatorType.IN),
                        new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                      }, this.BuVO);
                        
                        docItembygade.ForEach(docI =>
                        {
                            
                            var documents = docItembylot.Find(x => x.Document_ID == docI.Document_ID);

                            var datasdocument = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ID",string.Join(',',docI.Document_ID), SQLOperatorType.IN),
                                 }, this.BuVO);

                           
                            datasdocument.ForEach(doc =>
                            {
                                var docTypeIDs = doc.DocumentType_ID.GetValueInt();
                                var EvenStatus = doc.EventStatus.GetValueInt();
                                var qtyPer = AMWUtil.Common.ObjectUtil.QryStrGetValue(docI.Options, GCLOptionVOConst.OPT_QTY_PER_PALLET);
                                var qtyPers = Decimal.Parse(qtyPer);
                                
                                if (qtyPers < 1500)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Pallet Not Correct");

                                if (EvenStatus == 10 || EvenStatus == 11)
                                {
                                    if (docI.Options != null && docTypeIDs == 1011)
                                    {
                                        string codeMax = docItembygade.Max(x => x.BaseCode);
                                        string codeMin = docItembygade.Min(x => x.BaseCode);
                                        //var baseCodeMax = ObjectUtil.ConvertTextFormatToModel<QR>(codeMax, "{gade}  {lot} {pallet}");
                                        var leghtMax = codeMax.Length;
                                        var leghtMin = codeMin.Length;

                                        if (leghtMax < 25 && leghtMin < 25)
                                        {
                                            var baseCodeMax = codeMax.Substring(20, 4);
                                            var baseCodeMin = codeMin.Substring(20, 4);
                                            var palletMax = Int32.Parse(baseCodeMax);
                                            var palletMin = Int32.Parse(baseCodeMin);
                                            var noPallet1 = Int32.Parse(qrModel1.pallet);
                                            var noPallet2 = Int32.Parse(qrModel2.pallet);

                                            if (noPallet1 >= palletMin && noPallet1 <= palletMax && noPallet2 >= palletMin && noPallet2 <= palletMax)
                                            {
                                                res.docId = doc.ID;
                                                res.start_pallet = baseCodeMin;
                                                res.end_pallet = baseCodeMax;
                                            }
                                            else
                                            {
                                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, " Status Document not Correct");
                                            }
                                        }
                                    }
                                }

                            });
                        });

                    }

                }
                else if (qrModel1 != null && qrModel2 == null)
                {


                    if (qrModel1.gade.Length > 8)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, " QRCode Gade Not Correct");

                    if (qrModel1.lot.Length > 9)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, " QRCode Lot Not Correct");

                    if (qrModel1.pallet.Length > 4)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, " QRCode Pallet Not Correct");


                    var docItembygade = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                         new SQLConditionCriteria("ref1",string.Join(',',qrModel1.gade), SQLOperatorType.IN),
                         new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                      }, this.BuVO);

                    var docItembylot = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("lot",string.Join(',',qrModel1.lot), SQLOperatorType.IN),
                        new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                     }, this.BuVO);

               


                    docItembygade.ForEach(docI =>
                    {
                        var documents = docItembygade.Find(x => x.Document_ID == docI.Document_ID);

                        var datasdocument = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ID",string.Join(',',docI.Document_ID), SQLOperatorType.IN),
                                 }, this.BuVO);


                        datasdocument.ForEach(doc =>
                        {
                        var docTypeIDs = doc.DocumentType_ID.GetValueInt();

                        var EvenStatus = doc.EventStatus.GetValueInt();
                            var qtyPer = AMWUtil.Common.ObjectUtil.QryStrGetValue(docI.Options, GCLOptionVOConst.OPT_QTY_PER_PALLET);
                            var qtyPers = Decimal.Parse(qtyPer);
                            
                            if (qtyPers < 1500)
                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Pallet Not Correct");

                            if (EvenStatus == 10 || EvenStatus == 11)
                            {
                                if (docI.Options != null && docTypeIDs == 1011)
                                {
                                    var codeMax = docItembygade.Max(x => x.BaseCode);
                                    var codeMin = docItembygade.Min(x => x.BaseCode);
                                    var leghtMax = codeMax.Length;
                                    var leghtMin = codeMin.Length;

                                    if (leghtMax < 25 && leghtMin < 25)
                                    {

                                        var baseCodeMax = codeMax.Substring(20, 4);
                                        var baseCodeMin = codeMin.Substring(20, 4);
                                        var palletMax = Int32.Parse(baseCodeMax);
                                        var palletMin = Int32.Parse(baseCodeMin);
                                        var noPallet1 = Int32.Parse(qrModel1.pallet);

                                        if (noPallet1 >= palletMin && noPallet1 <= palletMax)
                                        {

                                            res.docId = doc.ID;
                                            res.start_pallet = baseCodeMin;
                                            res.end_pallet = baseCodeMax;

                                            var datasdocumentPA = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ParentDocument_ID",string.Join(',',docI.Document_ID), SQLOperatorType.IN),
                                 }, this.BuVO);


                                            datasdocumentPA.ForEach(pa =>
                                            {

                                            //res.start_pallet = docoption.startPallet;
                                            //res.end_pallet = docoption.endPallet;
                                            //res.docId = doc.ID;
                                            //res.putawayCode = pa.Code;
                                            //res.putawayID = pa.ID.Value;
                                            //res.start_pallet = null;
                                            //res.end_pallet = null;
                                            res.docId = doc.ID;
                                                res.putawayCode = pa.Code;
                                                res.putawayID = pa.ID.Value;

                                            });

                                        }
                                        else
                                        {
                                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Document Not Found");
                                        }
                                    }

                                }
                            }

                        });
                    
                    });

                }
            }

            if (res.docId != null)
            {

                var datadocument = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ID",string.Join(',',res.docId), SQLOperatorType.IN),
                                 }, this.BuVO);
                int i = 0;
                datadocument.ForEach(datadoc =>
                {
                    var docTypeIDs = datadoc.DocumentType_ID.GetValueInt();

                    if (docTypeIDs == 1011)
                    {
                        var datadocumentItem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID", string.Join(',', datadoc.ID), SQLOperatorType.IN), }, this.BuVO);

                        var datadocumentItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID", string.Join(',', datadoc.ID), SQLOperatorType.IN), }, this.BuVO);

                        res.docCode = datadoc.Code;


                        datadocumentItem.ForEach(Item =>
                        {

                            res.skuCode = Item.SKUMaster_Code;
                            res.skuName = Item.SKUMaster_Name;
                            res.skuId = Item.SKUMaster_ID;
                            res.lot = Item.Lot;
                            res.gade = Item.Ref1;



                            packList.Add(new PackSto()
                            {
                                pstoCode = Item.SKUMaster_Code,
                                pstoName = Item.SKUMaster_Name,
                                batch = Item.Batch,
                                lot = Item.Lot,
                                orderNo = Item.OrderNo,
                                itemNo = Item.ItemNo,
                                refID = Item.RefID,
                                ref1 = Item.Ref1,
                                ref2 = Item.Ref2,
                                ref3 = Item.Ref3,
                                ref4 = Item.Ref4,
                                cartonNo = Item.CartonNo,
                                forCustomerID = datadoc.For_Customer_ID,
                                //options = AMWUtil.Common.ObjectUtil.QryStrSetValue(docitemPutaway.Options,new KeyValuePair<string, object>(OptionVOConst.OPT_PALLET_NO, qrModel.numPalelt), new KeyValuePair<string, object>(OptionVOConst.OPT_DOCITEM_ID, qrModel.dociID)),
                                options = Item.Options,
                                addQty = Item.Quantity,
                                unitTypeCode = StaticValue.UnitTypes.First(x => x.ID == Item.UnitType_ID).Code,
                                packUnitTypeCode = StaticValue.UnitTypes.First(x => x.ID == Item.BaseUnitType_ID).Code,
                                expiryDate = Item.ExpireDate,
                                productDate = Item.ProductionDate,
                                auditStatus = Item.AuditStatus
                            });

                            i++;


                        });
                        res.datas = packList;

                    }


                });

            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Document not Found");
            }


            return res;
        }

    }
}

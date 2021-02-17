using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Exception;
using AMWUtil.Common;
using AWMSEngine.Common;
using ADO.WMSStaticValue;
using AWMSEngine.Engine.V2.Business.Document;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.SP.Request;
using AWMSEngine.Engine.V2.Business.Received;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria.SP.Response;
using ADO.WMSDB;
using AWMSEngine.Engine.V2.General;
using static AWMSEngine.Engine.V2.General.GetDocByQRCode;
using TRes = AWMSEngine.Engine.V2.General.GetDocByQRCode.TRes;

namespace ProjectGCL.Engine.WorkQueue
{
    public class ReadQrCode : IProjectEngine<GetDocByQRCode.TReq, GetDocByQRCode.TRes>
    {
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

        public long ? docId;
        public string docCode;
      

        protected override GetDocByQRCode.TRes ExecuteEngine(AMWLogger logger, VOCriteria buVO, GetDocByQRCode.TReq reqVO)
        {
            var res = new TRes();

            var packList = new List<GetDocByQRCode.PackSto>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();
            //res.datas = new List<TRes.DocData>();
            if (reqVO.qr != null)
            {
                var qrModel = ObjectUtil.ConvertTextFormatToModel<QR>(reqVO.qr, "{gade}_{lot}_{pallet}");

                if (qrModel == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "QR Code invalid");



                if (qrModel.gade.Length > 8)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, " QRCode Gade Not Correct");

                if (qrModel.lot.Length > 9)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, " QRCode Lot Not Correct");

                if (qrModel.pallet.Length > 4)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, " QRCode Pallet Not Correct");

                var docs  = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                   new SQLConditionCriteria("Ref1",string.Join(',',qrModel.gade), SQLOperatorType.IN),
                      }, this.BuVO);

                var docItembygade = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                   new SQLConditionCriteria("Ref1",string.Join(',',qrModel.gade), SQLOperatorType.IN),
                      }, this.BuVO);

                var docItembylot = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Lot",string.Join(',',qrModel.lot), SQLOperatorType.IN),
                     }, this.BuVO);


                if (docItembygade is not null && docItembylot is not null)
                {

                    var documents = new amt_DocumentItem();
                    var dcts = new amt_Document();

                    docs.ForEach(doc =>
                    {

                        var docTypeID = doc.DocumentType_ID.GetValueInt();
                        docItembygade.ForEach(docI =>
                        {

                            if (docTypeID == 1001)
                            {


                                documents = docItembylot.Find(x => x.Document_ID == docI.Document_ID &&
                                x.Lot == docI.Lot && x.SKUMaster_ID == docI.SKUMaster_ID &&
                                x.UnitType_ID == docI.UnitType_ID && x.Ref1 == docI.Ref1
                                );
                            }
                        });
                    });
                    


                    if (documents != null)
                        {
                            var datasdocument = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ID",string.Join(',',documents.Document_ID), SQLOperatorType.IN),
                                     }, this.BuVO);
                        
                            var datasdocumentitem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ID",string.Join(',',documents.ID), SQLOperatorType.IN),
                                     }, this.BuVO);

                        datasdocument.ForEach(doc =>
                            {

                                datasdocumentitem.ForEach(item =>
                                {
                                    var docTypeIDs = doc.DocumentType_ID.GetValueInt();
                                    if (item.Options != null && docTypeIDs == 1001)
                                    {

                                        var docoption = ObjectUtil.ConvertTextFormatToModel<PalletNo>(item.Options, "discharge={discharge}&start_pallet={startPallet}&end_pallet={endPallet}&qty_per_pallet={qty_per_pallet}");
                                        var startPallet = Int32.Parse(docoption.startPallet);
                                        var endPallet = Int32.Parse(docoption.endPallet);
                                        var noPallet = Int32.Parse(qrModel.pallet);

                                        if (noPallet < endPallet)
                                        {

                                            docId = doc.ID;
                                        }
                                        else
                                        {
                                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Document Not Found");
                                        }
                                    }

                                }); 

                            });
                        }
                  
                
                }
            }
            else {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Document Not Found");
            }

            if (docId != 0 && docId != null)
            {

                var datadocument = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ID",string.Join(',',docId), SQLOperatorType.IN),
                                 }, this.BuVO);
            
                int i = 0;
                datadocument.ForEach(datadoc =>

             
                {
                    var docTypeIDs = datadoc.DocumentType_ID.GetValueInt();

                    if (docTypeIDs == 1001)
                    {
                        var datadocumentItem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID", string.Join(',', datadoc.ID), SQLOperatorType.IN), }, this.BuVO);
                       
                        var datasdocGR = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ID",string.Join(',',datadoc.ParentDocument_ID), SQLOperatorType.IN),
                                     }, this.BuVO);

                        datasdocGR.ForEach(gr => {
                            res.grCode = gr.Code;
                            res.grID = gr.ID.Value;
                        });

                        res.putawayCode = datadoc.Code;
                        res.putawayID = datadoc.ID.Value;
                        res.processType = datadoc.DocumentProcessType_ID;

                        datadocumentItem.ForEach(Item =>
                        {

                            /* res. = Item.SKUMaster_Code;
                             res.skuName = Item.SKUMaster_Name;
                             res.skuId = Item.SKUMaster_ID;
                             res.lot = Item.Lot;
                             res.gade = Item.Ref1;*/

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
                                addQty = Item.Quantity.Value,
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
            else {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Document Not Found");
            }

            return res;
        }
    }
}
       




using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Engine.WorkQueue
{
    public class RegisterWorkQueue_GetDocumentItemAndDISTO : IProjectEngine<
        RegisterWorkQueue.TReqDocumentItemAndDISTO,
        List<amt_DocumentItem>
        >
    {
        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            var reqVO = data.reqVO;

            var sto = data.sto;
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();

            if (sto.eventStatus == StorageObjectEventStatus.NEW || sto.eventStatus == StorageObjectEventStatus.AUDITED || sto.eventStatus == StorageObjectEventStatus.AUDITING)
            {

                docItems = this.ProcessReceiving(sto, reqVO, logger, buVO);

                if (sto.eventStatus != StorageObjectEventStatus.AUDITED && sto.eventStatus != StorageObjectEventStatus.AUDITING)
                {
                    if (docItems.Count() == 0)
                        throw new AMWException(logger, AMWExceptionCode.V2001, "Good Received Document Not Found");
                }
            }
            else
            {
                throw new AMWException(logger, AMWExceptionCode.V2002, "Can't receive Base Code '" + reqVO.baseCode + "' into ASRS because it has Event Status '" + sto.eventStatus + "'");
            }

            return docItems;
        }
        //==========================================================================================================

        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();


            foreach (var mappingPallet in reqVO.mappingPallets)
            {
                var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
                var mapstoTree = mapsto.ToTreeList();
                var packs = mapstoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();

                if (mapsto.eventStatus == StorageObjectEventStatus.AUDITED || mapsto.eventStatus == StorageObjectEventStatus.AUDITING)
                {
                    var listDoc = AWMSEngine.ADO.DocumentADO.GetInstant()
                        .ListBySTO(mapstoTree.FindAll(x => x.type == StorageObjectType.PACK)
                        .Select(x => x.id.Value).ToList(), DocumentTypeID.AUDIT, buVO);

                    var listDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(listDoc.FirstOrDefault().ID.Value, buVO);

                    var mapstoPack = mapstoTree.FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();

                    listDocItem.ForEach(docItem =>
                    {
                        docItem.DocItemStos.ForEach(disto =>
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value,
                                disto.Sou_StorageObject_ID,
                                Convert.ToDecimal(mappingPallet.qty) - mapstoPack.qty,
                                Convert.ToDecimal(mappingPallet.qty) - mapstoPack.qty,
                                EntityStatus.ACTIVE, buVO);
                        });
                    });

                    var pack = reqVO.mappingPallets.FirstOrDefault(y => mapstoPack.code == y.code);
                    mapstoPack.qty = Convert.ToDecimal(pack.qty);
                    mapstoPack.baseQty = Convert.ToDecimal(pack.qty);

                    AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(mapstoPack, buVO);

                    return listDocItem;

                }
                else
                {
                    //Get Doc
                    amt_Document docGR = new amt_Document();
                    List<amt_DocumentItem> docGRItems = new List<amt_DocumentItem>();
                    if (reqVO.areaCode == "R")
                    {
                        //Inbound Zone
                        docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                           new SQLConditionCriteria[] {
                           new SQLConditionCriteria("MovementType_ID",4010, SQLOperatorType.EQUALS),
                           new SQLConditionCriteria("EventStatus","10,11",SQLOperatorType.IN)
                         }, buVO).FirstOrDefault();

                         docGRItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                            new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Document_ID",docGR.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("EventStatus","10,11",SQLOperatorType.IN),
                         }, buVO);

                    }
                    else if (reqVO.areaCode == "FS")
                    {
                        //Outbound Zone
                         docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                           new SQLConditionCriteria[] {
                           new SQLConditionCriteria("MovementType_ID",5011, SQLOperatorType.EQUALS),
                           new SQLConditionCriteria("EventStatus","10",SQLOperatorType.EQUALS)
                         }, buVO).FirstOrDefault();

                        docGRItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                            new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Document_ID",docGR.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("EventStatus","10,11",SQLOperatorType.IN),
                        }, buVO);
                    }
                    docGR.DocumentItems = docGRItems;
                    docItems.AddRange(docGR.DocumentItems);
                }
            }
            return docItems;
        }

    }
}


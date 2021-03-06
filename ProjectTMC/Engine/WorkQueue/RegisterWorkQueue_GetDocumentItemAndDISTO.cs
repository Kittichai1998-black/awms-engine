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
                        throw new AMWException(logger, AMWExceptionCode.V2001, "ไม่พบเอกสารสำหรับการรับเข้า");
                }
            }
            else
            {
                throw new AMWException(logger, AMWExceptionCode.V2002, "ไม่สามารถรับพาเลท " + reqVO.baseCode + " เข้าคลังได้ เนื่องจาก EventStatus เป็น " + sto.eventStatus );
            }

            return docItems;
        }
        //==========================================================================================================

        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();

                    //Get Doc
                    amt_Document docGR = new amt_Document();
                    List<amt_DocumentItem> docGRItems = new List<amt_DocumentItem>();
                    if (reqVO.areaCode == "In")
                    {
                        //Inbound Zone
                        docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                           new SQLConditionCriteria[] {
                           new SQLConditionCriteria("DocumentProcessType_ID",4010, SQLOperatorType.EQUALS),
                           new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.GOODS_RECEIVED,SQLOperatorType.EQUALS),
                           new SQLConditionCriteria("EventStatus","10,11",SQLOperatorType.IN)
                         }, buVO).FirstOrDefault();

                         docGRItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                            new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Document_ID",docGR.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("EventStatus","10,11",SQLOperatorType.IN),
                         }, buVO);

                    }
                    else if (reqVO.areaCode == "Out")
                    {
                        //Outbound Zone
                         docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                           new SQLConditionCriteria[] {
                           new SQLConditionCriteria("DocumentProcessType_ID",5011, SQLOperatorType.EQUALS),
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
                    var listDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docGR.ID.Value, buVO);
            return listDocItem;
        }

    }
}


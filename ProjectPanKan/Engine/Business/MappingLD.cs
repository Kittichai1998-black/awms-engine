using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Picking;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectPanKan.Engine.Business
{

    public class MappingLD : IProjectEngine<TestPick.TReq, List<amt_DocumentItemStorageObject>>
    {
      
        public List<amt_DocumentItemStorageObject> ExecuteEngine(AMWLogger logger, VOCriteria buVO, TestPick.TReq reqVO)
        {
            var DocItemsMapLD = new List<amt_DocumentItemStorageObject>();

            var docGI = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docIDs, buVO);

            if (docGI.EventStatus == DocumentEventStatus.WORKED)//Pick หมดแล้ว
            {
                var LinkLDid = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                    new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("LinkDocument_ID",reqVO.docIDs),
                    new KeyValuePair<string,object>("EventStatus", DocumentEventStatus.NEW)
                }, buVO).FirstOrDefault();

                if(LinkLDid != null) //มี LD ผูกอยู่
                {
                   var DocItemsMap = new List<amt_DocumentItemStorageObject>();

                   var docItemsLD = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                        new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Document_ID",LinkLDid.Document_ID),
                        new KeyValuePair<string,object>("EventStatus", DocumentEventStatus.NEW)
                   }, buVO).FirstOrDefault();

                   var listDocStosGI = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docGI.ID.Value, buVO);

                   foreach(var docStos in listDocStosGI)
                    {
                        docStos.DocItemStos.ForEach(disto =>
                        {
                            DocItemsMap.Add(new amt_DocumentItemStorageObject()
                            {
                                DocumentItem_ID = docItemsLD.ID,
                                DocumentType_ID = DocumentTypeID.GOODS_LOADING,
                                WorkQueue_ID = null,
                                Sou_StorageObject_ID = disto.Sou_StorageObject_ID,
                                Des_StorageObject_ID = disto.Des_StorageObject_ID,
                                Quantity = disto.Quantity,
                                UnitType_ID = disto.UnitType_ID,
                                BaseUnitType_ID = disto.BaseUnitType_ID,
                                Status = EntityStatus.INACTIVE

                            });
                        });
                    }

                   DocItemsMapLD = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(DocItemsMap, buVO);

                }
            }
            return DocItemsMapLD; 
        }

    
    }
}
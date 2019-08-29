using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using ProjectAAI.ADO.SAPApi;
using static ProjectAAI.ADO.SAPApi.SAPCriteria;
using static ProjectAAI.ADO.SAPApi.SAPInterfaceADO;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class DoneQueueClosed : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {
            reqVO.ForEach(x =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                if (docs != null)
                {

                    var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, buVO);
                    if (distos == null)
                        throw new AMWException(logger, AMWExceptionCode.B0001, "Document Item Not Found");

                    if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                    {
                        distos.ForEach(disto => {
                            var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, true, false, buVO);
                            var bsto = stos.ToTreeList().Where(y => y.type == StorageObjectType.BASE).FirstOrDefault();
                             
                            var resSAP = SendDataToSAP_ZWMRF002(bsto.code, docs.ID.Value, buVO);

                            var TANUM = resSAP.datas.Find(data => data.TANUM != 0).TANUM;
                            UpdateBaseStorageObject(bsto.id.Value, bsto.options, OptionVOConst.OPT_TANUM, TANUM, buVO);
                        });
                    }
                    else
                    {

                        distos.ForEach(disto => {
                            var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, true, false, buVO);
                            var bsto = stos.ToTreeList().Where(y => y.type == StorageObjectType.BASE).FirstOrDefault();

                            var options = ObjectUtil.QryStrToDynamic(docs.Options);
                            //ObjectUtil.QryStrGetValue(stos.options, "lgber")
                           
                            if (docs.Ref1 == "R01" || docs.Ref1 == "R02" || docs.Ref1 == "R06")
                            {
                                ZSWMRF004_IN_AWS reqData = new ZSWMRF004_IN_AWS()
                                {
                                    MODE = docs.Ref1,
                                    LENUM = bsto.code,
                                    LGTYP = options[OptionVOConst.OPT_LGTYP],
                                    LGBER = options[OptionVOConst.OPT_LGBER],
                                    LGPLA = options[OptionVOConst.OPT_LGPLA],
                                    BWLVS = options[OptionVOConst.OPT_BWLVS],
                                    GI_DOC = docs.Code
                                };

                                var resSAP = SendDataToSAP_ZWMRF004(reqData, buVO);
                                var BTANR = resSAP.datas.Find(data => data.BTANR != 0).BTANR;
                                UpdateBaseStorageObject(bsto.id.Value, bsto.options, OptionVOConst.OPT_BTANR, BTANR.ToString(), buVO);

                            }
                            else if (docs.Ref1 == "R03" || docs.Ref1 == "R04")
                            {
                                ZSWMRF005_IN_AWS reqData = new ZSWMRF005_IN_AWS()
                                {
                                    MODE = docs.Ref1,
                                    LENUM = bsto.code,
                                    LGTYP = options[OptionVOConst.OPT_LGTYP],
                                    LGBER = options[OptionVOConst.OPT_LGBER],
                                    LGPLA = options[OptionVOConst.OPT_LGPLA],
                                    BWLVS = options[OptionVOConst.OPT_BWLVS],
                                    GI_DOC = docs.Code
                                };

                                var resSAP = SendDataToSAP_ZWMRF005(reqData, buVO);
                                var BTANR = resSAP.datas.Find(data => data.BTANR != 0).BTANR;
                                UpdateBaseStorageObject(bsto.id.Value, bsto.options, OptionVOConst.OPT_BTANR, BTANR.ToString(), buVO);


                            }
                            else if (docs.Ref1 == "R05")
                            {
                                ZSWMRF006_IN_AWS reqData = new ZSWMRF006_IN_AWS()
                                {
                                    MODE = docs.Ref1,
                                    LENUM = bsto.code,
                                    LGTYP = options[OptionVOConst.OPT_LGTYP],
                                    LGBER = options[OptionVOConst.OPT_LGBER],
                                    LGPLA = options[OptionVOConst.OPT_LGPLA],
                                    BWLVS = options[OptionVOConst.OPT_BWLVS],
                                    GI_DOC = docs.Code
                                };
                                var resSAP = SendDataToSAP_ZWMRF006(reqData, buVO);
                                var BTANR = resSAP.datas.Find(data => data.BTANR != 0).BTANR;
                                UpdateBaseStorageObject(bsto.id.Value, bsto.options, OptionVOConst.OPT_BTANR, BTANR.ToString(), buVO);

                            }
                        });
                         
                    }
                    

                
                       // if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                       // {
                            var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, buVO);
                            if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                            {
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, buVO);
                            }
                       // }
                       // else
                       // {
                       //     AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, null, null, DocumentEventStatus.CLOSED, buVO);
                       // }
                  
                }
                else
                {
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Document Not Found");
                }
            });

            return reqVO;
        }
        private SapResponse<ZSWMRF002_OUT_SU> SendDataToSAP_ZWMRF002(string suCode, long docID, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF002(suCode, docID, buVO);
            return res;
        }
        private SapResponse<ZSWMRF004_OUT_SAP> SendDataToSAP_ZWMRF004(ZSWMRF004_IN_AWS data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF004(data, buVO);
            return res;
        }
        private SapResponse<ZSWMRF005_OUT_SAP> SendDataToSAP_ZWMRF005(ZSWMRF005_IN_AWS data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF005(data, buVO);
            return res;
        }
        private SapResponse<ZSWMRF006_OUT_SAP> SendDataToSAP_ZWMRF006(ZSWMRF006_IN_AWS data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF006(data, buVO);
            return res;
        } 
 
        private void UpdateBaseStorageObject(long bstoID, string options, string key, dynamic value, VOCriteria buVO)
        {
            var optionsNew = ObjectUtil.QryStrSetValue(options, key, value);
            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bstoID, buVO,
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("Options", optionsNew)
                });
        }
    }
}

using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class ClosedDocument : BaseEngine<ClosedDocument.TDocReq, dynamic>
    {
        public class TDocReq
        {
            public long[] docIDs;
            public StorageObjectEventStatus? stoEvtStatus = null;
        }

        protected override dynamic ExecuteEngine(TDocReq reqVO)
        {
            List<dynamic> data = new List<dynamic>();
            List<StorageObjectCriteria> stoCriteria = new List<StorageObjectCriteria>();
            foreach (var docID in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID, this.BuVO);

                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + docID + " Not Found or Status : REMOVE");

                if (doc.EventStatus != DocumentEventStatus.CLOSING)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "The document status is not WORKED, Cannot close the document");
            }
            foreach (var docID in reqVO.docIDs)
            {
                string Code = "SendERPAPIOnClosed";
                var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID, this.BuVO);
                string configValue = this.StaticValue.GetConfig(Code);
                string strMethod = doc.DocumentType_ID + "_" + Code + "_" + doc.MovementType_ID;

                FeatureCode featureCode = (FeatureCode)System.Enum.Parse(typeof(FeatureCode), strMethod);
                Type type = Assembly.GetExecutingAssembly().GetType(configValue);
                MethodInfo method = type.GetMethod(strMethod);

                if (StaticValueManager.GetInstant().IsFeature(featureCode) && method != null)
                {
                    ERPReturnValues result = (ERPReturnValues)method.Invoke(Activator.CreateInstance(type), new object[] { doc, this.BuVO });
                    if (result.status == 1)
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, EntityStatus.ACTIVE, DocumentEventStatus.CLOSED, this.BuVO);
                        if (reqVO.stoEvtStatus != null)
                        {
                            var baseSto = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(docID, null, null, this.BuVO);
                            baseSto.ForEach(x => {
                                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.sou_id, null, null, reqVO.stoEvtStatus, this.BuVO);
                            });
                        }
                        data.Add(result.data);
                    }
                    else if (result.status == 0)
                    {
                        doc.Options = AMWUtil.Common.ObjectUtil.QryStrSetValue(doc.Options, "ERRMsg", string.Join(", ", result.message));
                        ADO.DocumentADO.GetInstant().Put(doc, this.BuVO);
                    }
                }
            }
            return data;
        }
    }
}

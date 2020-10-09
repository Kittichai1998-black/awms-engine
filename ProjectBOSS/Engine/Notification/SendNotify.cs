using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Notification;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOSS.Engine.Notification
{
    public class SendNotify : IProjectEngine<List<long>, List<long>>
    {
        public class TRes
        {
        }

        public class STOResponse
        {
            public string BaseCode;
            public string Code;
            public string Name;
            public decimal Quantity;
            public string UnitType;
            public decimal Weight;
            public string OldWeight;
            public string AuditStatus;
        }


        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {

            var countingAutoDocs = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("ID", string.Join(",", reqVO), SQLOperatorType.EQUALS),
                new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.PHYSICAL_COUNT, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("DocumentProcessType_ID", "5181,4181", SQLOperatorType.IN),
            }, buVO).Select(x=> x.ID).ToArray();

            var docs = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("Document_ID", string.Join(",", countingAutoDocs), SQLOperatorType.EQUALS),
            }, buVO).GroupBy(x=> x.Document_ID).Select(x=> new { docID=x.Key, docItems=x.ToList() }).ToList();

            var noti = new CountingNotify();

            docs.ForEach(doc =>
            {
                var docItemIDs = doc.docItems.Select(x => x.ID).Distinct().ToList();
                var stoInDoc = new List<STOResponse>();
                docItemIDs.ForEach(docItemID =>
                {
                    var stoList = AWMSEngine.ADO.DocumentADO.GetInstant().GetSTOByDocItem(docItemID.Value, buVO);
                    var errSto = stoList.Select(sto=>
                    {
                        var auditStatus = AMWUtil.Common.ObjectUtil.QryStrGetValue(sto.Options, OptionVOConst.OPT_ERROR_COUNTING);
                        var oldWeight = AMWUtil.Common.ObjectUtil.QryStrGetValue(sto.BaseOptions, OptionVOConst.OPT_OLD_WEIGHT);
                        return new STOResponse()
                        {
                            BaseCode = sto.BaseCode,
                            Code = sto.Code,
                            Name = sto.Name,
                            Quantity = sto.Quantity,
                            UnitType = StaticValueManager.GetInstant().UnitTypes.Find(x => sto.UnitType_ID == x.ID).Code,
                            Weight = sto.BaseWeight,
                            OldWeight = oldWeight,
                            AuditStatus = string.IsNullOrEmpty(auditStatus) ? "PASS" : auditStatus
                        };
                    }).ToList();
                    stoInDoc.AddRange(errSto);
                });

                noti.Execute(logger, buVO, new
                {
                    Title = "ข้อมูลตรวจสอบสินค้าอัตโนมัติ",
                    Message = stoInDoc,
                    Signature = "",
                    Tag1 = "",
                    Tag2 = "",
                    Code = "CountingNotify"
                });
            });

            return null;
        }

    }
}

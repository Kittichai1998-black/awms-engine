using AWMSEngine.ADO;
using AWMSEngine.ADO.WMSDB;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOSS.Engine.Audit
{
    public class AuditNotify : BaseEngine<string, List<AuditNotify.STOSendEmail>>
    {
        public class STOSendEmail
        {
            public string BaseCode;
            public string PackName;
            public string Lot;
            public string VendorLot;
            public string ControlNo;
            public DateTime? ProductDate;
            public DateTime? ExpiryDate;
            public string Status;
            public string OldStatus;
        }

        protected override List<STOSendEmail> ExecuteEngine(string reqVO)
        {
            var dataSend = new List<STOSendEmail>();
            var stos = DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("Status", "0,1", SQLOperatorType.IN),
                new SQLConditionCriteria("ObjectType", StorageObjectType.PACK, SQLOperatorType.EQUALS)
                }, this.BuVO);
            var getStoUpdateAudit = stos.FindAll(sto => { return AMWUtil.Common.ObjectUtil.QryStrGetValue(sto.Options, OptionVOConst.OPT_OLD_AUDIT_STATUS) != null; });
            getStoUpdateAudit.ForEach(sto =>
            {
                var oldStatus = AMWUtil.Common.ObjectUtil.QryStrGetValue(sto.Options, OptionVOConst.OPT_OLD_AUDIT_STATUS);
                var bsto = StorageObjectADO.GetInstant().Get(sto.ParentStorageObject_ID.Value, StorageObjectType.BASE, false, false, BuVO);
                dataSend.Add(new STOSendEmail()
                {
                    BaseCode = bsto.code,
                    PackName = sto.Name,
                    Lot = sto.Lot,
                    VendorLot = sto.Ref1,
                    ControlNo = sto.OrderNo,
                    ProductDate = sto.ProductDate,
                    ExpiryDate = sto.ExpiryDate,
                    Status = AMWUtil.Common.EnumUtil.GetValueString(sto.AuditStatus),
                    OldStatus = oldStatus
                });
            });

            return dataSend;
        }
    }
}

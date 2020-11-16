using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using ProjectBOTHY.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Engine.WorkQueue
{
    public class UpdateAuditStatus : BaseEngine<UpdateAuditStatus.TReq, string>
    {
        public class TReq
        {
            public string baseCode;//รหัสพาเลท
            public IOType ioType = IOType.INPUT;
            public decimal? weight;//น้ำหนัก Kg.
            public decimal? width;//กว้าง M.
            public decimal? length;//ยาว M.
            public decimal? height;//สูง M.
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public string locationCode;//รหัสเกต
            public string desWarehouseCode;
            public string desAreaCode;
            public string desLocationCode;
            public string forCustomerCode;
            public DateTime actualTime;
            public List<string> barcode_pstos;
            public bool autoDoc = false;
            public string options;
            public long bstosID;
            public string remark;
            public string aditStatus;

        }

        protected override string ExecuteEngine(UpdateAuditStatus.TReq reqVO)
        {
            AuditStatus AdStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.aditStatus);

            var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstosID, StorageObjectType.BASE, false, true, this.BuVO);

            sto.AuditStatus = AdStatus;
            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, reqVO.remark);
            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_OLD_AUDIT_STATUS, reqVO.aditStatus);

            ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
            foreach (var pack in sto.mapstos)
            {
              
                pack.AuditStatus = AdStatus;
                pack.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(pack.options, OptionVOConst.OPT_REMARK, reqVO.remark);
                pack.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(pack.options, OptionVOConst.OPT_OLD_AUDIT_STATUS, reqVO.aditStatus);

                
                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(pack, this.BuVO);
            }
            
            return null;
        }
       
    }
}

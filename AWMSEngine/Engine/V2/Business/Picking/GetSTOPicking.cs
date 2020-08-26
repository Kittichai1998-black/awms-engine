using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class GetSTOPicking : BaseEngine<GetSTOPicking.TReq, GetSTOPicking.TRes>
    {
        public class TReq
        {
            public string baseCode;

        }
        public class TRes
        {
            public string baseCode;
            public long baseID;
            public List<PickItems> pickItems;
            public class PickItems
            {
                public long packID;
                public string packCode;
                public string lot;
                public string cartonNo;
                public string orderNo;
                public string batch;
                public string itemNo;
                public string refID;
                public string ref1;
                public string ref2; 
                public string ref3;
                public string ref4;
                public List<StoItems> stoItems;

                public class StoItems
                {
                    public long pk_docCode;
                    public long pk_docItemID;
                    public long distoID;
                    public decimal pickQty;
                    public string destination; 
                }
            }
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            
            if(reqVO.baseCode == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "กรุณาระบุรหัสพาเลทที่ต้องการเบิก");
            //var getDisto = ADO.DocumentADO.GetInstant().Lis
            var getSto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, this.BuVO);
            var selectPacks = getSto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Distinct().ToList();

            return res;
        }
    }
}

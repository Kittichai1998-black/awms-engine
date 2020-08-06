using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class ScanMappingSTO : BaseEngine<ScanMappingSTO.TReq, ScanMappingSTO.TRes>
    {
        public class TReq
        {
            public DocumentProcessTypeID processType;
            public string bstoCode;
            public long? bstoID;

            public string pstoCode;
            public long? pstoID;

            public long warehouseID;
            public long areaID;
            public long? locationID;

            public string batch;
            public string lot;
            public string orderNo;
            public string refID;
            public string ref1;
            public string ref2;
            public string ref3;
            public string ref4;
            public string cartonNo;
            public string options;
            public decimal addQty;
            public string unitTypeCode;
            public string packUnitTypeCode;
            public DateTime? expireDate;
            public DateTime? incubationDate;
            public DateTime? productDate;

        }
        public class TRes
        {
            public StorageObjectCriteria sto;
            public long? GR_ID;
            public string GR_Code;
            public long? PA_ID;
            public string PA_Code;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            StorageObjectCriteria mapsto = null;


            return res;
        }

    }
}

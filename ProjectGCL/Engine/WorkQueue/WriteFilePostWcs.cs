using AMWUtil.Logger;
using AWMSEngine.Engine;
using AMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AMSModel.Criteria.SP.Request;
using AMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.Issued;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace ProjectGCL.Engine.Document
{
    public class WriteFilePostWcs : BaseEngine<WriteFilePostWcs.TReq, WriteFilePostWcs.TRes>
    {

        public class TReq 
        {
            public string GateCode;
            public List<string> QR;
            public long? DocID;
        }
        public class TRes
        {
            public string GateCode;
            public List<string> QR;
            public string Location;
        }
        public class LocationList
        {
            public int bank;
            public int level;
            public int qty;
            public int receive;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var docs = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(reqVO.DocID.Value, this.BuVO);
            var list_loc = new LocationList();
            var location = AMWUtil.Common.ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_LOCATION);
            if (!string.IsNullOrWhiteSpace(location))
            {
                //location_options.AddRange(JsonConvert.DeserializeObject<List<LocationList>>(location));
                list_loc = JsonConvert.DeserializeObject<LocationList>(location);
             
            }
            var bank = list_loc.bank.ToString().PadLeft(3, '0');
            var lv = list_loc.level.ToString().PadLeft(3, '0');
            var res = new TRes()
            {
              GateCode = reqVO.GateCode,
              QR = reqVO.QR,
              Location = bank+ lv
            };
            var uniqID = AMWUtil.Common.ObjectUtil.GenUniqID();
            var post_wcs_part_in = ADO.WMSStaticValue.StaticValueManager.GetInstant().Configs.Find(x => x.DataKey == "post_wcs_part_in").DataValue;
            var post_wcs_part_out = ADO.WMSStaticValue.StaticValueManager.GetInstant().Configs.Find(x => x.DataKey == "post_wcs_part_out").DataValue;


            AMWUtil.DataAccess.APIFileAccess.WriteLocalSync<TRes>(this.Logger, post_wcs_part_in, post_wcs_part_out, uniqID, res,1500);


            
            return null;
        }
    }
}

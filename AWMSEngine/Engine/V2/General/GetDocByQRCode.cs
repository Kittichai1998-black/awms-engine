using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class GetDocByQRCode : BaseEngine<GetDocByQRCode.TReq, GetDocByQRCode.TRes>
    {

        public class TReq
        {
            public string qr;
        };
        public class TRes
        {
            public List<DocData> datas;
            public class DocData
            {
                public int docID;
                public string docCode;
                public int dociID;
                public string Batch;
                public string Lot;
                public decimal Quantity;
                public string unitType;
                public string SKUItem;
            }
        }
        public class QR
        {
            public string numPalelt;
            public string dociID;
            public string qty;
        };
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            res.datas = new List<TRes.DocData>();

            if (reqVO.qr.StartsWith("N|"))
            {
                var qrModel = ObjectUtil.ConvertTextFormatToModel<QR>(reqVO.qr, "N|{numPalelt}|{dociID}|{qty}");
                List<long> dociID = qrModel.dociID.Split(',').Select(long.Parse).ToList();
                List<long> qty = qrModel.qty.Split(',').Select(long.Parse).ToList();
                int i = 0;
                dociID.ForEach(ID =>
                {
                    var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                    {
                          new SQLConditionCriteria("DocumentItem_ID",ID, SQLOperatorType.EQUALS)
                        //new SQLConditionCriteria("DocumentItem_ID", string.Join(',', ID), SQLOperatorType.IN),
                    }, this.BuVO).GroupBy(x => x.DocumentItem_ID).Select(x => new { dociID = x.Key, qty = x.Sum(y => y.Quantity) }).FirstOrDefault();
                    var distoQty = distos != null ? distos.qty : 0;
                    var doci = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
                    {
                       new SQLConditionCriteria("ID",ID, SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

                    if (qty[i] != 0 && qty[i] <= (doci.Quantity - distoQty))
                    {
                        var param = new Dapper.DynamicParameters();
                        param.Add("dociID", ID);
                        var resDocData = ADO.DataADO.GetInstant().QuerySP<TRes.DocData>(
                              "SP_GET_DOC_FROM_DOCI_ID",
                              param,
                              this.BuVO).FirstOrDefault();
                        if (resDocData != null)
                        {
                            resDocData.Quantity = qty[i];
                            res.datas.Add(resDocData);
                        }
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, "QR Code invalid");
                    }
                    i++;
                });
            }
            else
            {
                //config
            }
            if (res == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "DociID Not Found");

            return res;
        }
    }
}

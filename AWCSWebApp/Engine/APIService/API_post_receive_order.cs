using AMSModel.Criteria;
using AMWUtil.Common;
using AWCSWebApp.GCLModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp.Engine.APIService
{
    public class API_post_receive_order : BaseAPI<API_post_receive_order.TReq, dynamic>
    {
        public class TReq
        {
            public string qrCode;
        }
        protected override dynamic ChildExec(TReq request, VOCriteria buVO)
        {
            /* try
             {
                 string[] qrDatas = (request.qrCode).Split("|").Select(x => x.Trim()).ToArray();
                 string doc_wms = qrDatas[0];
                 string customer = qrDatas[1];
                 string grade = qrDatas[2];
                 string sku = qrDatas[3];
                 string lot = qrDatas[4];
                 int start_pallet = int.Parse(qrDatas[5].Substring(0, 4));
                 int end_pallet = int.Parse(qrDatas[5].Substring(4));
                 string warehouse = qrDatas[6];
                 decimal qty = decimal.Parse(qrDatas[7]);
                 string unit = qrDatas[8];
                 decimal qty_per_pallet = decimal.Parse(qrDatas[9]);
                 string storage_status = qrDatas[10];
                 string discharge = qrDatas[11];
                 List<string> list_pallet = new List<string>();
                 for (int i = start_pallet; i <= end_pallet; i++)
                     list_pallet.Add($"{grade} {lot} {i:0000}");

                 AMWRequestCreateGRDocList req = new AMWRequestCreateGRDocList()
                 {
                     RECORD = new List<AMWRequestCreateGRDocList.RECORD_LIST>()
                     {
                         new AMWRequestCreateGRDocList.RECORD_LIST()
                         {
                             LINE = new AMWRequestCreateGRDocList.LINELIST()
                             {
                                 api_ref = "WC1."+ObjectUtil.GenUniqID(),
                                 sku = sku,
                                 grade=grade,
                                 lot=lot,
                                 customer = customer,
                                 discharge=discharge,
                                 warehouse=warehouse,
                                 doc_wms=doc_wms,
                                 qty_per_pallet=qty_per_pallet,
                                 qty=qty,
                                 start_pallet=start_pallet,
                                 end_pallet=end_pallet,
                                 unit=unit,
                                 status = storage_status,
                                 List_Pallet = list_pallet

                             }
                         }
                     }
                 };


             }
             catch
             {
                 throw new Exception($"QRCode Format ไม่ถูกต้อง!");
             }


         if (mapReq._result.status == 1)
         {
             var res = receive_order(mapReq.datas);
             return res;
         }
         else
         {
             return mapReq;
         }*/
            return null;
        }
    }
}

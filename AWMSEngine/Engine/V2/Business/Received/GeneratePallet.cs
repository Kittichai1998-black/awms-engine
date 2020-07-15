using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using iTextSharp.text;
using Microsoft.VisualBasic.CompilerServices;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class GeneratePallet : BaseEngine<GeneratePallet.TReq, List<GeneratePallet.TRes>>
    {
        public class TReq
        {
            public long mode;
            public int minVolume;
            public int maxVolume;
            public List<item> item;
        }

        public class item
        {
            public string ItemCode;
            public int qty;


        }
        public class TRes
        {
            public List<pallet> pallet;
        }
        public class pallet
        {
            public int count_pallet;
            public string item_pallet;
            public int count_item_s_pallet; //qty Item ที่เศษใน Pallet
            public int count_s_pallet; //qty Pallet ที่เศษ
        }

        public class pallet_multi_list
        {
            public int count_pallet;
            public string item_pallet;
            public int count_item_s_pallet; //qty Item ที่เศษใน Pallet
            public int count_s_pallet; //qty Pallet ที่เศษ
        }
        public class pallet_multi
        {
            public List<pallet_item> pallet_multi_item;
        }
        public class pallet_item
        {
            public string item_pallet;
            public int item_qty;

        }
        protected override List<TRes> ExecuteEngine(TReq reqVO)
        {
            //var objectSize = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_ObjectSize>(
            //    new KeyValuePair<string, object>[] {
            //        new KeyValuePair<string,object>("ObjectType",2),
            //        new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
            //    }, this.BuVO).FirstOrDefault();
            var pallet_list = new List<pallet>();
            var pallet_multi_item = new List<pallet_multi_list>();
            var res = new TRes();


            foreach (var item_req in reqVO.item)
            {
                if (item_req.qty <= reqVO.maxVolume)
                {
                    pallet_list.Add(new pallet()
                    {
                        item_pallet = item_req.ItemCode,
                        count_pallet = 1,
                        count_s_pallet = 0,
                        count_item_s_pallet = 0
                    });
                }
                else
                {
                    pallet_list.Add(new pallet()
                    {

                        item_pallet = item_req.ItemCode,
                        count_pallet = item_req.qty / reqVO.maxVolume,
                        count_s_pallet = item_req.qty % reqVO.maxVolume > 0 ? 1 : 0,
                        count_item_s_pallet = item_req.qty % reqVO.maxVolume
                    });
                }
            }

            if (reqVO.mode == 0)
            {
                var qtyPalletStart = 0;
                var sum_pallet = 0;
                var item_s_pallet = "";
                //var sum = 0;
                for (var i = 0; i <= (pallet_list.Count - 1); i++)
                {

                    var itemPalletStart = pallet_list[i].item_pallet;

                    if (i == 0)
                        qtyPalletStart = pallet_list[i].count_item_s_pallet;

                    var sum = qtyPalletStart + (i + 1 <= pallet_list.Count - 1 ? pallet_list[i + 1].count_item_s_pallet : 0);

                    if(sum>= reqVO.maxVolume)
                        sum_pallet =sum - reqVO.maxVolume;

                    //var sum_s_pallet = sum % reqVO.maxVolume;
                    //===============================================
                    qtyPalletStart = sum_pallet;

                    if (sum_pallet <= 0 && i <= pallet_list.Count)
                    {
                        item_s_pallet = qtyPalletStart > pallet_list[i - 1].count_item_s_pallet ? itemPalletStart : pallet_list[i - 1].item_pallet;
                    }
                    pallet_multi_item.Add(new pallet_multi_list()
                    {
                        item_pallet = itemPalletStart + "|" + (i + 1 <= pallet_list.Count - 1 ? pallet_list[i + 1].item_pallet : ""),
                        count_pallet = sum_pallet,
                        //count_item_s_pallet = pallet_list[i].count_item_s_pallet+ "|" + (i + 1 <= pallet_list.Count - 1 ? pallet_list[i + 1].count_item_s_pallet : 0),
                        //count_s_pallet = sum_pallet == 0 ? 1 : 0

                        //item_s_pallet = qtyPalletStart > pallet_list[i+1].count_item_s_pallet ? itemPalletStart : pallet_list[i + 1].item_pallet
                    });
                }
            }
            var x = pallet_list;
            var y = pallet_multi_item;
            return null;
        }
    }
}

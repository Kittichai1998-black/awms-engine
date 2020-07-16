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
    public class GeneratePallet : BaseEngine<GeneratePallet.TReq, GeneratePallet.TRes>
    {
        public class TReq
        {
            public long mode;
            public int minVolume;
            public int maxVolume;
            public string supplierName;
            public string supplierCode;
            public List<Item> item;
        }
        public class TRes
        {
            public int layoutType;
            public List<pallet_list_item> listsCode;
        }
        public class pallet_list
        {
            public List<pallet_list_item> listsCode;

        }
        public class pallet_list_item
        {
            public string code;
            public string title;
            public string options;

        }
        public class Pallet
        {
            public int bcode;
            public string pcode;
            public int vol;
            public string lot;
            public string orderNo;
            public string docItemID;
        }
        public class Item
        {
            public string docItemID;
            public string code;
            public int vol;
            public string lot;
            public string orderNo;

        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            List<Item> Items = reqVO.item;
            List<Pallet> pallets = new List<Pallet>();           
            List<Pallet> findPalletX = new List<Pallet>();
            if (reqVO.mode == 1)
            {
                findPalletX = findPallet(Items, 100, 1, pallets, 100, 1);
            }
            else
            {
                findPalletX = findPallet(Items, 100, 1, pallets, 100, 0);
            }
            var pallet_list = findPalletX.GroupBy(x => x.bcode).Select(x => new { palletsNO = x.Key, palletsDetail = x.ToList() }).ToList();
            List<pallet_list_item> listItem = new List<pallet_list_item>();
            foreach (var pts in pallet_list)
            {

                var pcode = string.Join(',', pts.palletsDetail.Select(x => x.pcode));
                var pID = string.Join(',', pts.palletsDetail.Select(x => x.docItemID));
                var vol = string.Join(',', pts.palletsDetail.Select(x => x.vol));
                var lot = string.Join(',', pts.palletsDetail.Select(x => x.lot));
                var orderNo = string.Join(',', pts.palletsDetail.Select(x => x.orderNo));

                listItem.Add(new pallet_list_item()
                {
                    code = "N|" + pts.palletsNO + "|" + pID + "|" + vol,
                    title = "FINISHED GOODS",
                    options = "itemName="+ pcode +
                              "&lotNo="+ lot + "&controlNo="+ orderNo + 
                              "&supplier="+reqVO.supplierName+"&codeNo="+ reqVO.supplierCode +
                              "&receivedDate="+ DateTime.Now.ToString("MM/dd/yyyy")+ "&qtyReceived="+ vol +
                              "&palletNo=" + pts.palletsNO+"/"+ pallet_list.Count
                });
            }

            res = new TRes()
            {
                layoutType = 91,
                listsCode = listItem
            };

            return res;
        }
        private List<Pallet> findPallet(List<Item> item, int palletVol, int bcode, List<Pallet> palletList, int defaultVol, int mode)
        {
            int palletVolRemail = palletVol;
            var pallet = new Pallet();

            if (item.FirstOrDefault() != null)
            {
                var itemData = item.FirstOrDefault();

                if (palletVol < itemData.vol)
                {
                    pallet.vol = palletVol;
                    itemData.vol = itemData.vol - palletVol;
                }
                else
                {
                    pallet.vol = itemData.vol;
                    palletVolRemail -= itemData.vol;
                    itemData.vol = 0;
                }

                pallet.bcode = bcode;
                pallet.pcode = itemData.code;
                pallet.lot = itemData.lot;
                pallet.orderNo = itemData.orderNo;
                pallet.docItemID = itemData.docItemID;

                if (mode == 0)
                {
                    if (itemData.vol > 0)
                    {
                        var newBcode = bcode + 1;
                        palletList.Add(pallet);
                        findPallet(item.FindAll(x => x.vol != 0), defaultVol, newBcode, palletList, defaultVol, mode);
                    }
                    else if (itemData.vol == 0)
                    {
                        palletList.Add(pallet);
                        findPallet(item.FindAll(x => x.vol != 0), palletVolRemail, bcode, palletList, defaultVol, mode);
                    }
                }
                else
                {
                    var newBcode = bcode + 1;
                    palletList.Add(pallet);
                    findPallet(item.FindAll(x => x.vol != 0), defaultVol, newBcode, palletList, defaultVol, mode);
                }

            }

            return palletList;

        }
    }
}

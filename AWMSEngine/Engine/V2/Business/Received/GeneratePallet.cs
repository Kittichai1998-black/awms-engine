using System;
using System.Collections.Generic;
using System.Linq;
using AMWUtil.Exception;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class GeneratePallet : BaseEngine<GeneratePallet.TReq, GeneratePallet.TRes>
    {
        public class TReq
        {
            public long mode;
            public decimal minVolume;
            public decimal maxVolume;
            public string supplierName;
            public string supplierCode;
            public string remark;
            public int docID;
            public List<Item> item;
        }
        public class TRes
        {
            public int layoutType;
            public int docID;
            public List<pallet_list_item> listsCode;
            public List<pallet_list_item> listsCodeDisplay;
        }
        public class pallet_list
        {
            public List<pallet_list_item> listsCode;

        }
        public class pallet_list_item
        {
            public string code;
            public string title;
            public long skuType;
            public string options;

        }
        public class Pallet
        {
            public int bcode;
            public string pcode;
            public string pname;
            public decimal vol;
            public string unit;
            public string lot;
            public string orderNo;
            public string docItemID;
            public string skuType;
            public string expdate;
            public string prodDate;
            public string tag_qr;
            public decimal quantity;
            public decimal realQuantity;
            public decimal volsku;
        }
        public class Item
        {
            public string docItemID;
            public string code;
            public string name;
            public decimal vol;
            public string unit;
            public string lot;
            public string orderNo;
            public string skuType;
            public string expdate;
            public string prodDate;
            public string tag_qr;
            public decimal quantity;
            public decimal volsku;


        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            List<Item> Items = reqVO.item;
            List<Pallet> pallets = new List<Pallet>();           
            List<Pallet> findPalletX = new List<Pallet>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();
           
            var itemVol = reqVO.item.Sum(x=>x.vol);
            if (itemVol < reqVO.minVolume)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Volume item น้อยกว่า minVolume");

            foreach (var it in reqVO.item)
            {
                if (it.vol == 0 )
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Volume item เท่ากับ 0 ");
            }


            if (reqVO.mode == 1)
            {
                findPalletX = findPallet(Items, reqVO.maxVolume, 1, pallets, reqVO.maxVolume, 1);
            }
            else
            {
                findPalletX = findPallet(Items, reqVO.maxVolume, 1, pallets, reqVO.maxVolume, 0);
            }
            var pallet_list = findPalletX.GroupBy(x => x.bcode).Select(x => new { palletsNO = x.Key, palletsDetail = x.ToList() }).ToList();
            List<pallet_list_item> listItem = new List<pallet_list_item>();
            List<pallet_list_item> listItemDisplay = new List<pallet_list_item>();
            foreach (var pts in pallet_list)
            {

                var pcode = string.Join(',', pts.palletsDetail.Select(x=>x.pcode));
                var pname = string.Join(',', pts.palletsDetail.Select(x => x.pname));
                var pID = string.Join(',', pts.palletsDetail.Select(x => x.docItemID));
                var vol = string.Join(',', pts.palletsDetail.Select(x => x.realQuantity));
                var unit = string.Join(',', pts.palletsDetail.Select(x => x.unit));               
                var lot = string.Join(',', pts.palletsDetail.FindAll(x=> !string.IsNullOrWhiteSpace(x.lot)).Select(x => x.lot));
                var orderNo = string.Join(',', pts.palletsDetail.FindAll(x => !string.IsNullOrWhiteSpace(x.orderNo)).Select(x => x.orderNo));
                var skutype = pts.palletsDetail.Select(x => x.skuType).FirstOrDefault();
                var expdate = string.Join(',', pts.palletsDetail.FindAll(x => !string.IsNullOrWhiteSpace(x.expdate)).Select(x => x.expdate));
                var prodDate = string.Join(',', pts.palletsDetail.FindAll(x => !string.IsNullOrWhiteSpace(x.prodDate)).Select(x => x.prodDate));
                var tag_qr = string.Join(',', pts.palletsDetail.Select(x => x.tag_qr));

                var pcodeDisplay = string.Join(',', pts.palletsDetail.GroupBy(x => x.pcode).Select(x => x.Key).ToList());
                var pnameDisplay = string.Join(',', pts.palletsDetail.GroupBy(x => x.pname).Select(x => x.Key).ToList());
                var pIDDisplay = string.Join(',', pts.palletsDetail.Select(x => x.docItemID));
                var volDisplay = string.Join(',', pts.palletsDetail.Select(x => x.realQuantity));
                var unitDisplay = string.Join(',', pts.palletsDetail.Select(x => x.unit));
                var lotDisplay = string.Join(',', pts.palletsDetail.FindAll(x => !string.IsNullOrWhiteSpace(x.lot)).GroupBy(x => x.lot).Select(x => x.Key).ToList());
                var orderNoDisplay = string.Join(',', pts.palletsDetail.FindAll(x => !string.IsNullOrWhiteSpace(x.orderNo)).GroupBy(x => x.orderNo).Select(x => x.Key).ToList());
                var skutypeDisplay = pts.palletsDetail.Select(x => x.skuType).FirstOrDefault();
                var expdateDisplay = string.Join(',', pts.palletsDetail.FindAll(x => !string.IsNullOrWhiteSpace(x.expdate)).GroupBy(x => x.expdate).Select(x => x.Key).ToList());
                var prodDateDisplay = string.Join(',', pts.palletsDetail.FindAll(x => !string.IsNullOrWhiteSpace(x.prodDate)).GroupBy(x => x.prodDate).Select(x => x.Key).ToList());
                var tag_qrDisplay = string.Join(',', pts.palletsDetail.Select(x => x.tag_qr));

                listItemDisplay.Add(new pallet_list_item()
                {
                    code = "N|" + pts.palletsNO + "|" + pID + "|" + vol+"|"+ tag_qr,
                    skuType = StaticValue.SKUMasterTypes.FirstOrDefault(x => x.Name == skutype).ID.Value,
                    title = skutype,
                    options = "codeNo=" + pcode + "&itemName=" + pname +
                              "&lotNo="+ lot + "&controlNo="+ orderNo + 
                              "&supplier="+reqVO.supplierName+
                              "&mfgdate=" + prodDate + "&expdate="+ expdate +
                              "&qty=" + vol + "&unit=" + unit +
                              "&palletNo=" + pts.palletsNO+"/"+ pallet_list.Count +
                              "&remark="+ reqVO.remark
                });
                listItem.Add(new pallet_list_item()
                {
                    code = "N|" + pts.palletsNO + "|" + pID + "|" + vol + "|" + tag_qr,
                    skuType = StaticValue.SKUMasterTypes.FirstOrDefault(x => x.Name == skutype).ID.Value,
                    title = skutype,
                    options = "codeNo=" + (pcodeDisplay.Length < 15? pcodeDisplay : (pcodeDisplay.Substring(0, 15)+"...")) +
                    "&itemName=" + (pnameDisplay.Length < 35 ? pnameDisplay : (pnameDisplay.Substring(0, 35) + "..."))  +
                              "&lotNo=" + (lotDisplay.Length < 30 ? lotDisplay : (lotDisplay.Substring(0, 30) + "..."))  + 
                              "&controlNo=" + (orderNoDisplay.Length < 15 ? orderNoDisplay : (orderNoDisplay.Substring(0, 12) + "..."))  +
                              "&supplier=" + reqVO.supplierName +
                              "&mfgdate=" + (prodDateDisplay.Length < 15 ? prodDateDisplay : (prodDateDisplay.Substring(0, 12) + "..."))  +
                              "&expdate=" + (expdateDisplay.Length < 15 ? expdateDisplay : (expdateDisplay.Substring(0, 12) + "...")) +
                              "&qty=" + vol + "&unit=" + unitDisplay +
                              "&palletNo=" + pts.palletsNO + "/" + pallet_list.Count +
                              "&remark=" + reqVO.remark
                });
            }

            res = new TRes()
            {
                layoutType = 91,
                docID = reqVO.docID,
                listsCode = listItem,
                listsCodeDisplay = listItemDisplay
            };

            return res;
        }
        private List<Pallet> findPallet(List<Item> item, decimal palletVol, int bcode, List<Pallet> palletList, decimal defaultVol, int mode)
        {
            decimal palletVolRemail = palletVol;
            var pallet = new Pallet();
            Int32 unixTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            if (item.FirstOrDefault() != null)
            {
                var itemData = item.FirstOrDefault();

                if (palletVol < itemData.vol)
                {
                    pallet.vol = palletVol;
                    decimal qty = palletVol / itemData.volsku;
                    pallet.realQuantity = Math.Floor(qty);
                    itemData.vol = itemData.vol - palletVol;
                }
                else
                {
                    var realQty = palletList.FindAll(x => x.docItemID == itemData.docItemID).Select(x => x.vol).Sum(x =>
                    {
                        decimal qty = x / itemData.volsku;
                        return Math.Floor(qty);
                    });

                    var remainItem = itemData.quantity - realQty;

                    if(remainItem * itemData.volsku > palletVol)
                    {
                        pallet.vol = palletVol;
                        decimal qty = palletVol / itemData.volsku;
                        pallet.realQuantity = Math.Floor(qty);
                        itemData.vol = (remainItem * itemData.volsku) - palletVol;
                    }
                    else
                    {
                        pallet.realQuantity = remainItem;

                        palletVolRemail -= ((remainItem * itemData.volsku));
                        itemData.vol = 0;
                    }
                }

                pallet.bcode = bcode;
                pallet.pcode = itemData.code;
                pallet.pname = itemData.name;
                pallet.lot = itemData.lot;
                pallet.unit = itemData.unit;
                pallet.orderNo = itemData.orderNo;
                pallet.docItemID = itemData.docItemID;
                pallet.skuType = itemData.skuType;
                pallet.prodDate = itemData.prodDate;
                pallet.expdate = itemData.expdate;
                pallet.tag_qr = unixTimestamp + "-" + bcode+itemData.docItemID;
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

using AMWUtil.Logger;
using AMWUtil.PropertyFile;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{
    public class TestADO
    {
        public readonly ITestOutputHelper sysout;
        public TestADO(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void TestGetSTOCode()
        {
            PropertyFileManager.GetInstant().AddPropertyFile(PropertyConst.APP_KEY, @"D:\Application\awms-engine\AWMSEngine\app.property");
            VOCriteria buVO = new VOCriteria();
            AMWLoggerManager.InitInstant("D:/logs/test/", "{Date}.log");
            AMWLogger logger = AMWLoggerManager.GetLogger("test");
            var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get("THIP000144", 1, null, false, true, buVO);

            new AWMSEngine.Engine.V2.Validation.ValidateObjectSizeLimit().Execute(logger, buVO, sto);


        }

        [Fact]
        public void TestSendEmail()
        {
            VOCriteria buVO = new VOCriteria();
            AMWLoggerManager.InitInstant("D:/logs/test/", "{Date}.log");
            AMWLogger logger = AMWLoggerManager.GetLogger("test");
            //var sto = new AWMSEngine.Engine.V2.Notification.EmailNotification();
            //sto.Execute(logger, buVO, null);

        }

        [Fact]
        public void TestSendLine()
        {
            VOCriteria buVO = new VOCriteria();
            AMWLoggerManager.InitInstant("D:/logs/test/", "{Date}.log");
            AMWLogger logger = AMWLoggerManager.GetLogger("test");
            var sto = AMWUtil.DataAccess.Http.LineAccess.Notify(logger, "JkvvCi5DCu3kStfGqW4XNAgOTRIOVPRKVx7uw1SVtZH", "TEST");
            Console.WriteLine(sto);

        }
        public class Item
        {
            public string code;
            public int vol;
        }

        public class Pallet
        {
            public int bcode;
            public string pcode;
            public int vol;
        }

        [Fact]
        public void TestPallet()
        {
            List<Item> Items = new List<Item>();
            Items.Add(new Item() { code = "PJAAN04-0024", vol = 150 });
            Items.Add(new Item() { code = "PJAAN04-0026", vol = 160 });

            List<Pallet> pallets = new List<Pallet>();
            var findPalletX = findPallet(Items, 100, 1, pallets, 100, 1);
            var xxx = findPalletX.GroupBy(x => x.bcode).ToList();
            Console.WriteLine(findPalletX.First());
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

                if(mode == 0)
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

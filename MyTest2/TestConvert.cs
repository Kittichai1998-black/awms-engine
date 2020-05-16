using AMWUtil.Common;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using Xunit;
using Xunit.Abstractions;

namespace TestConvert
{
    public class TestConvert
    {
        public readonly ITestOutputHelper sysout;
        public TestConvert(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }

        [Fact]
        public void Test1()
        {
            //string[] testval = new string[] { "1-10","13","20-25" };
            string testval = "5-15,20-21";
            var resTest = AMWUtil.Common.RangeNumUtil.ExplodeRangeNum(testval);
            sysout.WriteLine(resTest);
        }
        [Fact]
        public void Test2()
        {
            string testval = "1,5,4,3,2,20,24,25,26,10,11,12";
            var resTest = AMWUtil.Common.RangeNumUtil.MergeRangeNum(testval);
            sysout.WriteLine(resTest);
        }
        [Fact]
        public void Test3()
        {
            var res = ObjectUtil.GenUniqID();
            sysout.WriteLine(res);
            sysout.WriteLine(res);
            sysout.WriteLine(res);
        }
        [Fact]
        public void TestIntersectRangeNum()
        {
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1-2", "3-4"));
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1-5", "3-9"));
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1,2,3,4,5,7", "5,6"));
            this.sysout.WriteLine(AMWUtil.Common.RangeNumUtil.IntersectRangeNum("1-10,20-30", "5-25"));
        }


        public class ConverterModel
        {
            public decimal C1_Qty;
            public string C1_Unit;
            public decimal C2_Qty;
            public string C2_Unit;
            public ConverterModel(decimal C1_Qty, string C1_Unit, decimal C2_Qty, string C2_Unit)
            {
                this.C1_Qty = C1_Qty;
                this.C1_Unit = C1_Unit;
                this.C2_Qty = C2_Qty;
                this.C2_Unit = C2_Unit;
            }
        }

        [Fact]
        public void ConverQty()
        {
            List<ConverterModel> cmodels = new List<ConverterModel>() {
            new ConverterModel(10,"PC",1,"KG"),
            new ConverterModel(100,"KG",1,"P"),
            new ConverterModel(2,"P",1,"CAR"),
            new ConverterModel(200,"KG",1,"BOX"),
            };
            List<ConverterModel> _cmodels = new List<ConverterModel>();
            foreach(var cm in cmodels)
            {
                _cmodels.Add(new ConverterModel(cm.C2_Qty, cm.C2_Unit, cm.C1_Qty, cm.C1_Unit));
            }
            cmodels.AddRange(_cmodels);

            var res = FConvertQty(3000, "PC", "CAR", cmodels);
            this.sysout.WriteLine((res??-1).ToString());
        }

        private static decimal? FConvertQty(decimal c1qty,string c1unit,string c2unit,List<ConverterModel> cmodels)
        {
            ConverterModel cm = cmodels.FirstOrDefault(x => x.C1_Unit == c1unit && x.C2_Unit == c2unit);
            if(cm != null)
            {
                return (c1qty / cm.C1_Qty) * cm.C2_Qty;
            }

            foreach(ConverterModel cm2 in cmodels.FindAll(x => x.C1_Unit == c1unit))
            {
                var _c1qty = (c1qty / cm2.C1_Qty) * cm2.C2_Qty;
                var _c1unit = cm2.C2_Unit;
                var _res = FConvertQty(_c1qty, _c1unit, c2unit, cmodels.FindAll(x => !x.Equals(cm2)));
                if (_res.HasValue)
                {
                    return _res;
                }
            }

            return null;
        }
    }

}

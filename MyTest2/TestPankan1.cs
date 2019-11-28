using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{
    public class TestPankan1
    {
        public readonly ITestOutputHelper sysout;
        public TestPankan1(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void TestGenericType()
        {
            
            Type t = EnumUtil.GetEnumType("AWMSModel.Constant.EnumConst.EntityStatus");
            MethodInfo method = typeof(EnumUtil).GetMethod("ListObjectView");
            method = method.MakeGenericMethod(t);
            var res = method.Invoke(this, new object[0]);
        }
        [Fact]
        public void TestDataGenID()
        {
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
            sysout.WriteLine(ObjectUtil.GenUniqID());
        }
        [Fact]
        public void TestDataDB1()
        {
            List<SPOutSTOMiniCriteria> values = new List<SPOutSTOMiniCriteria>();
            values.Add(new SPOutSTOMiniCriteria() { id = 450,type = (StorageObjectType)0, mstID = 450 ,objectSizeID = 1, parentID = null, parentType = null });
            values.Add(new SPOutSTOMiniCriteria() { id = 443, type = (StorageObjectType)1, mstID = 1719 ,objectSizeID = 5, parentID = 450, parentType = StorageObjectType.LOCATION });
            values.Add(new SPOutSTOMiniCriteria() { id = 448, type = (StorageObjectType)2, mstID = 71 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 450, type = (StorageObjectType)2, mstID = 74 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 452, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 453, type = (StorageObjectType)2, mstID = 88 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 454, type = (StorageObjectType)2, mstID = 88 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 458, type = (StorageObjectType)2, mstID = 107 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 460, type = (StorageObjectType)2, mstID = 88 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 462, type = (StorageObjectType)2, mstID = 107 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 465, type = (StorageObjectType)2, mstID = 88 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 466, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 468, type = (StorageObjectType)2, mstID = 88 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 470, type = (StorageObjectType)2, mstID = 107 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 471, type = (StorageObjectType)2, mstID = 226 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 473, type = (StorageObjectType)2, mstID = 240 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 475, type = (StorageObjectType)2, mstID = 106 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 477, type = (StorageObjectType)2, mstID = 92 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 479, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 481, type = (StorageObjectType)2, mstID = 75 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 482, type = (StorageObjectType)2, mstID = 239 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 483, type = (StorageObjectType)2, mstID = 273 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 484, type = (StorageObjectType)2, mstID = 190 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 485, type = (StorageObjectType)2, mstID = 74 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 486, type = (StorageObjectType)2, mstID = 106 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 487, type = (StorageObjectType)2, mstID = 89 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 488, type = (StorageObjectType)2, mstID = 72 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 489, type = (StorageObjectType)2, mstID = 74 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 490, type = (StorageObjectType)2, mstID = 89 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 491, type = (StorageObjectType)2, mstID = 90 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 492, type = (StorageObjectType)2, mstID = 75 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 493, type = (StorageObjectType)2, mstID = 89 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 494, type = (StorageObjectType)2, mstID = 75 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 495, type = (StorageObjectType)2, mstID = 274 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 496, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 497, type = (StorageObjectType)2, mstID = 277 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 498, type = (StorageObjectType)2, mstID = 124 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 499, type = (StorageObjectType)2, mstID = 71 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 500, type = (StorageObjectType)2, mstID = 74 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 501, type = (StorageObjectType)2, mstID = 72 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 502, type = (StorageObjectType)2, mstID = 106 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 503, type = (StorageObjectType)2, mstID = 122 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 504, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 505, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 506, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 507, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 508, type = (StorageObjectType)2, mstID = 272 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 509, type = (StorageObjectType)2, mstID = 71 ,objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });

            var objsizes = new List<AWMSModel.Entity.ams_ObjectSize>();
            objsizes.Add(new AWMSModel.Entity.ams_ObjectSize() { ID = 1, Code="XXX", ObjectSizeInners=new List<AWMSModel.Entity.ams_ObjectSizeMap>() });
            //objsizes[0].ObjectSizeInners.Add(new AWMSModel.Entity.ams_ObjectSizeMap() { ID=1,Code="XXX" });
            //StorageObjectCriteria sto = StorageObjectCriteria.Generate(values,objsizes,null , 443);

        }
    }
}

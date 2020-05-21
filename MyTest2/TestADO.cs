using AMWUtil.Logger;
using AMWUtil.PropertyFile;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
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
    }
}

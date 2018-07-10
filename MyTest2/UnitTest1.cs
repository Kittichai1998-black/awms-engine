using AMWUtil.PropertyFile;
using AWMSModel.Constant.StringConst;
using System;
using Xunit;

namespace MyTest2
{
    public class UnitTest1
    {
        [Fact]
        public void Test1()
        {
            PropertyFileManager.GetInstant().AddPropertyFile(PropertyConst.APP_KEY,
                @"D:\Application\Web\AWMSEngine\AWMSEngine\app.property");
            
            //var res = AWMSEngine.ADO.StorageObjectADO.GetInstant().GetStorageObjectByRelationCode("ST-S01-1/1/1");
            //Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(res));
        }
    }
}

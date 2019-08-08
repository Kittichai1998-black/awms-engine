using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{
    public class TestSAPApi
    {
        public readonly ITestOutputHelper sysout;
        public TestSAPApi(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }

        [Fact]
        public void TestPost()
        {
            var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(
                null, 
                "http://thipgwdev.thantawan.com:8000/sap/zjson2api/ZICF_MMI0040?sap-client=300", AMWUtil.DataAccess.Http.RESTFulAccess.HttpMethod.POST,
                new
                {
                    iv_matnr = "DMRD-0001",
                    iv_werks = "1100",
                    iv_lgort = "1101",
                    iv_charg = "1802080022"
                },
                new AMWUtil.DataAccess.Http.BasicAuthentication("ASRSDEV01", "thailand01"));

            this.sysout.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(res));
        }
    }
}

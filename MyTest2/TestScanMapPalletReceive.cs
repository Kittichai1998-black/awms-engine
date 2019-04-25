using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Xunit.Abstractions;
using ProjectSTA.APIService.WM;
namespace TestScanMapPalletReceive
{
    public class TestScanMapPalletReceive
    {
        public readonly ITestOutputHelper sysout;
        public TestScanMapPalletReceive(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void Test1()
        {
            int areaID = 8;
            string scanCode = "90900017000005xxxxxxxx0001";
            string orderNo = scanCode.Substring(0, 7);
            string skuCode = scanCode.Substring(7, 14);
            string cartonNo = scanCode.Substring(22, 4);
            sysout.WriteLine(orderNo);
            sysout.WriteLine(skuCode);
            sysout.WriteLine(cartonNo);

            //var res = ScanMapPalletReceiveAPI.ScanMapPalletReceiveAPI(areaID, scanCode);
        }

        }
}

using System;
using System.Collections.Generic;
using System.Text;
using Xunit;

namespace UnitTestProject1
{
    public class TestMRK
    {
        [Fact]
        public void TestRead()
        {
            var proj = new ProjectMRK.Engine.Bussiness.ReadFileXML();
            proj.test();
        }
    }
}

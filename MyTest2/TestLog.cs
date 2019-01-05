using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace MyTest2
{

    public class TestLog
    {
        ITestOutputHelper sysout;
        public TestLog(ITestOutputHelper sysout)
        {
            this.sysout = sysout;
        }
        [Fact]
        public void Loging()
        {
            AMWUtil.Logger.AMWLoggerManager.InitInstant(@"D:\logs\{MachineName}\{Date}\", @"{RefID}.{Date}.log");

            for (int x = 0; x < 10; x++)
                Task.Run(() =>
                {
                     var log1 = AMWUtil.Logger.AMWLoggerManager.GetLogger("TOKENID000123", "ALL");
                    for (int i = 0; i < 500; i++)
                    {
                        log1.LogInfo(i + "=Test 1111111111");
                        //Thread.Sleep(50);
                    }
                });

            Console.ReadKey();
        }

        [Fact]
        public void LinkList()
        {
            LinkedList<int> lk01 = new LinkedList<int>();
            lk01.AddLast(1);
            lk01.AddLast(2);
            lk01.AddLast(3);
            LinkedList<int> lk02 = new LinkedList<int>();
            lk02.AddLast(4);
            lk02.AddLast(5);
            lk02.AddLast(6);
            var n = lk02.First;
            //lk02.RemoveFirst();
            foreach (var l in lk01)
            {
                sysout.WriteLine(l.ToString());
            }
        }
    }
}

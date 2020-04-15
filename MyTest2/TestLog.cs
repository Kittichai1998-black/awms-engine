using Quartz;
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

        public class JobTest : IJob
        {
            public Task Execute(IJobExecutionContext context)
            {
                ITestOutputHelper sysout = (ITestOutputHelper)context.MergedJobDataMap.Get("sysout");
                sysout.WriteLine(context.MergedJobDataMap.Get("key").ToString() + " -- " + DateTime.Now);
                return null;
            }
        }

        [Fact]
        public void ReadName()
        {
            sysout.WriteLine(typeof(AWMSModel.Entity.ams_ObjectSize).Name);
            //Console.ReadKey();
        }

        [Fact]
        public void Loging()
        {
            Queue<string> q = new Queue<string>();
            q.Enqueue("1");
            q.Enqueue("2");
            q.Enqueue("3");
            string a1 = q.Dequeue();
            q.Enqueue("4");
            string a2 = q.Dequeue();
            string a3 = q.Dequeue();

            AMWUtil.Logger.AMWLoggerManager.InitInstant(@"D:\logs\{MachineName}\{Date}\", @"{LogName}.{Date}.log");
            //int ii = 0;
            for (int x = 1; x <= 1000; x++)
            {
                Task.Run(() =>
                {
                    string ii = DateTime.Now.Ticks.ToString();
                    var log1 = AMWUtil.Logger.AMWLoggerManager.GetLogger("TOM12", "ALL");
                    for (int i = 1; i <= 100; i++)
                    {
                        log1.LogInfo(ii +'.'+ i.ToString("000"));
                    }
                    string ii2 = "xx";
                });
            }

            Console.ReadKey();
        }

        [Fact]
        public void TestJob()
        {
            AMWUtil.Common.SchedulerUtil.Start<JobTest>("0/10 * * * * ?",
                new KeyValuePair<string, object>("sysout", sysout),
                new KeyValuePair<string, object>("key", "Test01"));
            AMWUtil.Common.SchedulerUtil.Start<JobTest>("0/11 * * * * ?",
                new KeyValuePair<string, object>("sysout", sysout),
                new KeyValuePair<string, object>("key", "Test02"));
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

        [Fact]
        public void TestLDAP()
        {
            //var res = new AMWUtil.DataAccess.LDAPAuthenticate().ValidateUser("www.zflexldap.com", "guest1", "guest1password", "uid=,ou=users,ou=guests,dc=zflexsoftware,dc=com");

        }
    }
}

using AMWUtil.DataAccess;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Information;
using Quartz;
using System;
using System.Collections.Generic;
using System.IO;
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
        public void SPPrint()
        {
            Dapper.DynamicParameters p = new Dapper.DynamicParameters();
            p.Add("test1", "1");
            p.Add("@test2", "2");
            p.Add("@test3", 3);
            p.Add("@test4", new string[] { "1", "2" });
            p.Add("@test5", string.Join(',', new string[] { "1", "2" }));

            string txt = BaseDatabaseAccess.DynamicParametersToString(p);
            this.sysout.WriteLine(txt);
        }
        [Fact]
        public void Loging()
        {
            AMWUtil.Logger.AMWLoggerManager.InitInstant(@"D:\logs\{MachineName}\{Date}\", @"{LogName}.{Date}.log");
            DateTime startTime = DateTime.Now;
            for (int x = 1; x <= 10; x++)
            {
                int i9 = x;
                Task.Run(() =>
                {
                    try
                    {
                        string ii = i9.ToString("0000");
                        var log1 = AMWUtil.Logger.AMWLoggerManager.GetLogger("TOM-"+ii, "ALL");
                        for (int i = 1; i <= 10000; i++)
                        {
                            log1.LogInfo(ii + '.' + i.ToString("000"));
                        }
                        lock (this)
                        {
                            using (StreamWriter sw = new StreamWriter(@"D:\logs\AMW618040\20200711\diff.txt", true))
                            {
                                sw.WriteLine((DateTime.Now.Ticks - startTime.Ticks).ToString("#:000:0000"));
                                sw.Flush();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        this.sysout.WriteLine(ex.Message);
                    }
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

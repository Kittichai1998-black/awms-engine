using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WCSSimAPI
{
    public class ConstConfig
    {
        public static string DBConnection = @"Server=192.168.200.11;Uid=sa;PASSWORD=@mwte@mp@55;database=AMWES-THIP-AMWM;Max Pool Size=400;Connect Timeout=600;";
        public static string WMSApiURL = "http://192.168.200.11:8090/";

        public static string CronEx = "* * * * * *";
    }
}

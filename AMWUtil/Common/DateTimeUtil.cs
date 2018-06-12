using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Common
{
    public static class DateTimeUtil
    {
        static GregorianCalendar _gc = new GregorianCalendar();
        public static string GetDateTimeString(this DateTime? dt)
        {
            string dtx = "";
            if (dt.HasValue)
            {
                dtx += dt.Value.Year.ToString() + "-";
                dtx += (dt.Value.Month < 10 ? "0" + dt.Value.Month.ToString() : dt.Value.Month.ToString()) + "-";
                dtx += (dt.Value.Day < 10 ? "0" + dt.Value.Day.ToString() : dt.Value.Day.ToString());
                dtx += " ";
                dtx += (dt.Value.Hour < 10 ? "0" + dt.Value.Hour.ToString() : dt.Value.Hour.ToString()) + ":";
                dtx += (dt.Value.Minute < 10 ? "0" + dt.Value.Minute.ToString() : dt.Value.Minute.ToString()) + ":";
                dtx += (dt.Value.Second < 10 ? "0" + dt.Value.Second.ToString() : dt.Value.Second.ToString());
            }
            return dtx;
        }
        public static string GetDateString(this DateTime? d)
        {
            string dx = "";
            if (d.HasValue)
            {
                dx += d.Value.Year.ToString() + "-";
                dx += (d.Value.Month < 10 ? "0" + d.Value.Month.ToString() : d.Value.Month.ToString()) + "-";
                dx += (d.Value.Day < 10 ? "0" + d.Value.Day.ToString() : d.Value.Day.ToString());
            }
            return dx;
        }
        
        public static string GetDateTimeISO(this DateTime? dt)
        {
            string dx = "";
            if (dt.HasValue)
            {
                dx = dt.Value.ToUniversalTime().ToString("s") + "Z";
            }
            return dx;
        }
        public static int GetWeekOfMonth(this DateTime time)
        {
            DateTime first = new DateTime(time.Year, time.Month, 1);
            return time.GetWeekOfYear() - first.GetWeekOfYear() + 1;
        }

        static int GetWeekOfYear(this DateTime time)
        {
            return _gc.GetWeekOfYear(time, CalendarWeekRule.FirstDay, DayOfWeek.Monday);
        }

        public static DateTime GetDateTime(string dt)
        {
            var tmp = dt.Split(' ');
            var d = tmp[0].Split('-');
            var t = tmp[1].Split(':');
            return new DateTime(int.Parse(d[0]), int.Parse(d[1]), int.Parse(d[2]), int.Parse(t[0]), int.Parse(t[1]), int.Parse(t[2]));
        }

        public static DateTime GetDate(string d)
        {
            var tmp = d.Split('-');
            return new DateTime(int.Parse(tmp[0]), int.Parse(tmp[1]), int.Parse(tmp[2]));
        }
    }
    
}

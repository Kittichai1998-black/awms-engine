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
        public const string DATETIME_FORMAT = "dd-MM-yyyy HH:mm:ss";
        public const string DATE_FORMAT = "dd-MM-yyyy";
        static GregorianCalendar _gc = new GregorianCalendar();
        public static string GetDateTimeString(this DateTime dt)
        {
            return dt.ToString(DATETIME_FORMAT);
        }
        public static string GetDateTimeString(this DateTime? dt)
        {
            if (dt.HasValue)
            {
                return dt.Value.ToString(DATETIME_FORMAT);
            }
            return null;
        }
        public static string GetDateString(this DateTime d)
        {
            return d.ToString(DATE_FORMAT);
        }
        public static string GetDateString(this DateTime? d)
        {
            if (d.HasValue)
            {
                return d.Value.ToString(DATE_FORMAT);
            }
            return null;
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

        public static DateTime? GetDateTime(this string dt)
        {
            try
            {
                return DateTime.ParseExact(dt, DATETIME_FORMAT, CultureInfo.InvariantCulture);
            }
            catch
            {
                return null;
            }
        }

        public static DateTime? GetDate(this string d)
        {
            try
            {
                return DateTime.ParseExact(d, DATE_FORMAT, CultureInfo.InvariantCulture);
            }
            catch
            {
                return null;
            }        
        }
    }
    
}
